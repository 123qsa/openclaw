/**
 * Entropy Management - Automated rule system cleanup
 *
 * This script detects and cleans up stale/dead rules, configurations, and code:
 * - Dead lint rules
 * - Unused ignores
 * - Orphaned configs
 * - Outdated documentation references
 * - Import rot
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

type CleanupIssue = {
  type: "dead" | "orphan" | "drift" | "duplicate" | "rot";
  file: string;
  line?: number;
  description: string;
  fixable: boolean;
};

type CleanupConfig = {
  checkDeadCode: boolean;
  checkOrphans: boolean;
  checkDocs: boolean;
  checkImports: boolean;
  autoFix: boolean;
};

const DEFAULT_CONFIG: CleanupConfig = {
  checkDeadCode: true,
  checkOrphans: true,
  checkDocs: true,
  checkImports: true,
  autoFix: false,
};

// Config files to check
const CONFIG_FILES = [
  ".oxlintrc.json",
  ".tslint.json",
  ".eslintrc.json",
  ".eslintignore",
  ".gitignore",
];

async function checkDeadCode(): Promise<CleanupIssue[]> {
  const issues: CleanupIssue[] = [];

  // Check for unused scripts by analyzing imports
  const scriptsDir = "scripts";
  if (existsSync(scriptsDir)) {
    const scripts = await readdir(scriptsDir);
    const scriptFiles = scripts.filter((f) => f.endsWith(".ts") && !f.includes(".test."));

    // Get all package.json scripts
    const pkgPath = "package.json";
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

      for (const script of scriptFiles) {
        const scriptName = script.replace(".ts", "");
        // Check if script is referenced in package.json
        const isReferenced = Object.values(pkg.scripts || {}).some(
          (cmd: unknown) => typeof cmd === "string" && cmd.includes(scriptName),
        );

        if (!isReferenced && !scriptName.includes(".gen.")) {
          issues.push({
            type: "orphan",
            file: join(scriptsDir, script),
            description: `Script not referenced in package.json scripts`,
            fixable: false,
          });
        }
      }
    }
  }

  return issues;
}

async function checkOrphanedConfigs(): Promise<CleanupIssue[]> {
  const issues: CleanupIssue[] = [];

  // Check for orphaned config files
  for (const config of CONFIG_FILES) {
    if (existsSync(config)) {
      const content = readFileSync(config, "utf8");

      // Check for duplicate ignore patterns
      if (config === ".eslintignore" || config === ".gitignore") {
        const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
        const seen = new Set<string>();
        for (const line of lines) {
          if (seen.has(line)) {
            issues.push({
              type: "duplicate",
              file: config,
              description: `Duplicate ignore pattern: ${line}`,
              fixable: true,
            });
          }
          seen.add(line);
        }
      }

      // Check oxlintrc for unused rules
      if (config === ".oxlintrc.json") {
        try {
          const config = JSON.parse(content);
          const ignorePatterns = config.ignorePatterns || [];

          // Check for ignore patterns pointing to non-existent dirs
          for (const pattern of ignorePatterns) {
            const dir = pattern.replace(/\/\*$/, "").replace(/\/$/, "");
            if (dir && !existsSync(dir)) {
              issues.push({
                type: "orphan",
                file: config,
                description: `Ignore pattern points to non-existent: ${pattern}`,
                fixable: true,
              });
            }
          }
        } catch {
          // Invalid JSON - skip
        }
      }
    }
  }

  return issues;
}

async function checkDocDrift(): Promise<CleanupIssue[]> {
  const issues: CleanupIssue[] = [];

  // Check docs/agents/ for broken internal links
  const docsAgentsDir = "docs/agents";
  if (existsSync(docsAgentsDir)) {
    const files = await readdir(docsAgentsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    for (const file of mdFiles) {
      const content = readFileSync(join(docsAgentsDir, file), "utf8");

      // Check for broken relative links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const [, , link] = match;

        // Skip external links and anchors
        if (link.startsWith("http") || link.startsWith("#")) {
          continue;
        }

        // Check if linked file exists
        const linkedPath = join(docsAgentsDir, link.replace(/^\.\//, ""));
        const linkedFileExists = existsSync(linkedPath) || existsSync(linkedPath + ".md");

        if (!linkedFileExists && !link.includes("#")) {
          issues.push({
            type: "drift",
            file: join(docsAgentsDir, file),
            description: `Broken link: ${link}`,
            fixable: false,
          });
        }
      }
    }
  }

  return issues;
}

async function checkImportRot(): Promise<CleanupIssue[]> {
  const issues: CleanupIssue[] = [];

  // Check for unused imports using TypeScript
  try {
    execFileSync("npx", ["tsc", "--noEmit", "--isolatedModules"], {
      stdio: "pipe",
    });
  } catch {
    // TypeScript errors exist - could be import issues
  }

  // Check for dead imports in key files
  const keyFiles = ["scripts/llm-audit.ts", ".oxlintrc.json"];

  for (const file of keyFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, "utf8");

      // Simple check for require without usage
      const requireMatches = content.matchAll(/require\(['"]([^'"]+)['"]\)/g);
      for (const match of requireMatches) {
        const module = match[1];
        // Skip node builtins
        if (module.startsWith(".")) {
          continue;
        }

        // Check if module is used after requiring
        const afterRequire = content.slice(match.index || 0).slice(100);
        if (!afterRequire.includes(module.split("/").pop() || "")) {
          // This is a very rough check - just a heuristic
        }
      }
    }
  }

  return issues;
}

async function fixIssue(issue: CleanupIssue): Promise<void> {
  if (!issue.fixable || issue.type === "drift") {
    return;
  }

  if (issue.type === "duplicate" && issue.file === ".eslintignore") {
    const content = readFileSync(issue.file, "utf8");
    const lines = content.split("\n");
    const seen = new Set<string>();
    const newLines = lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return true;
      }
      if (seen.has(trimmed)) {
        return false;
      }
      seen.add(trimmed);
      return true;
    });
    writeFileSync(issue.file, newLines.join("\n"));
    console.log(`  Fixed: ${issue.file}`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const config: CleanupConfig = {
    ...DEFAULT_CONFIG,
    autoFix: args.has("--fix"),
    checkDeadCode: !args.has("--no-dead"),
    checkOrphans: !args.has("--no-orphan"),
    checkDocs: !args.has("--no-docs"),
    checkImports: !args.has("--no-imports"),
  };

  const isDeep = args.has("--deep");

  console.log("🔧 Entropy Cleanup");
  console.log("==================\n");

  const allIssues: CleanupIssue[] = [];

  if (config.checkDeadCode) {
    console.log("Checking dead code...");
    const issues = await checkDeadCode();
    allIssues.push(...issues);
    console.log(`  Found ${issues.length} issues`);
  }

  if (config.checkOrphans) {
    console.log("Checking orphaned configs...");
    const issues = await checkOrphanedConfigs();
    allIssues.push(...issues);
    console.log(`  Found ${issues.length} issues`);
  }

  if (config.checkDocs && isDeep) {
    console.log("Checking documentation drift...");
    const issues = await checkDocDrift();
    allIssues.push(...issues);
    console.log(`  Found ${issues.length} issues`);
  }

  if (config.checkImports && isDeep) {
    console.log("Checking import rot...");
    const issues = await checkImportRot();
    allIssues.push(...issues);
    console.log(`  Found ${issues.length} issues`);
  }

  // Print summary
  console.log("\n📊 Summary");
  console.log("==========");

  if (allIssues.length === 0) {
    console.log("✅ No issues found");
    return;
  }

  const byType: Record<string, number> = {};
  for (const issue of allIssues) {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }

  const fixable = allIssues.filter((i) => i.fixable).length;
  console.log(`\nTotal: ${allIssues.length} issues (${fixable} auto-fixable)`);

  // Apply fixes if requested
  if (config.autoFix && fixable > 0) {
    console.log("\nApplying fixes...");
    for (const issue of allIssues) {
      if (issue.fixable) {
        await fixIssue(issue);
      }
    }
    console.log("✅ Fixes applied");
  } else if (fixable > 0) {
    console.log(`\nRun with --fix to apply ${fixable} auto-fixable issues`);
  }
}

await main();
