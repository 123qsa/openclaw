/**
 * LLM Audit - Semantic code auditing using LLM
 *
 * This script performs semantic code audits that go beyond what oxlint can catch:
 * - Code intent verification
 * - Design pattern consistency
 * - Business logic compliance
 * - Architecture boundary violations
 * - Security patterns
 *
 * Supported providers:
 * - MiniMax: set MINIMAX_API_KEY (default)
 * - Anthropic: set ANTHROPIC_API_KEY
 * - OpenAI: set OPENAI_API_KEY
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { globSync } from "tinyglobby";

type AuditConfig = {
  model: string;
  provider: "minimax" | "anthropic" | "openai";
  baseUrl?: string;
  categories: string[];
  exclude: string[];
  severity: "error" | "warning" | "info";
  maxFiles?: number;
};

type AuditIssue = {
  file: string;
  lineStart: number;
  lineEnd: number;
  category: string;
  message: string;
  confidence: number;
};

const DEFAULT_CONFIG: AuditConfig = {
  model: "MiniMax-M2.5",
  provider: "minimax",
  baseUrl: "https://api.minimaxi.com/v1",
  categories: ["intent", "patterns", "security", "architecture"],
  exclude: ["dist/", "node_modules/", "extensions/", "*.gen.ts", "*.bundle.js"],
  severity: "warning",
  maxFiles: 10,
};

function loadConfig(): AuditConfig {
  const configPath = ".llm-auditrc.json";
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf8");
    const userConfig = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...userConfig };
  }
  return DEFAULT_CONFIG;
}

function getChangedFiles(): string[] {
  try {
    const stdout = execFileSync("git", ["diff", "--name-only", "HEAD~1"], {
      encoding: "utf8",
    });
    return stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    // Fallback: list all ts files
    return [];
  }
}

function getAllFiles(): string[] {
  const files: string[] = [];
  const patterns = ["src/**/*.ts", "src/**/*.tsx", "scripts/**/*.ts"];

  for (const pattern of patterns) {
    const matches = globSync(pattern);
    files.push(...matches);
  }
  return files;
}

function filterFiles(files: string[], config: AuditConfig): string[] {
  return files
    .filter((f) => !config.exclude.some((e) => f.includes(e)))
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function callLLM(
  config: AuditConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey =
    process.env.MINIMAX_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("No API key found. Set MINIMAX_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY");
  }

  const endpoint = `${config.baseUrl}/chat/completions`;
  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} ${error}`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    content?: string[];
  };

  // Handle different response formats
  let content = "";

  if (result.choices?.[0]?.message?.content) {
    content = result.choices[0].message.content;
  } else if (result.content?.[0]) {
    content = result.content[0];
  }

  // Debug: log raw response if JSON parsing fails
  if (!content) {
    console.error("Raw API response:", JSON.stringify(result, null, 2));
  }

  return content;
}

const AUDIT_SYSTEM_PROMPT = `You are a code semantic auditor. Analyze TypeScript/JavaScript code for semantic issues that go beyond what linters can catch.

Audit categories to check:
1. INTENT - Code matches its documented intent, function names reflect behavior
2. PATTERNS - Consistent design patterns, no anti-patterns
3. SECURITY - Logic bugs, input validation, credential handling
4. ARCHITECTURE - Boundary violations, layer imports

Respond in JSON format:
{"issues": [{"file": "path", "lineStart": N, "lineEnd": M, "category": "intent|patterns|security|architecture", "message": "description", "confidence": 0-100}]}

If no issues found, respond: {"issues": []}`;

async function auditWithLLM(files: string[], config: AuditConfig): Promise<AuditIssue[]> {
  const apiKey =
    process.env.MINIMAX_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Demo mode
    console.log("📋 LLM Audit (Demo Mode)");
    console.log("========================");
    console.log(`Files to audit: ${files.length}`);
    console.log(`Categories: ${config.categories.join(", ")}`);
    console.log("");
    console.log("Note: Set MINIMAX_API_KEY for full LLM audit");
    console.log("");

    for (const file of files.slice(0, config.maxFiles ?? 5)) {
      const content = await readFileContent(file);
      const lines = content.split("\n").length;
      console.log(`  - ${file} (${lines} lines)`);
    }

    console.log("");
    console.log("✅ Demo complete. Set API key for full audit.");
    return [];
  }

  console.log(`📋 LLM Audit (${config.provider}/${config.model})`);
  console.log("==============================================");
  console.log(`Files to audit: ${files.length}`);

  const issues: AuditIssue[] = [];

  // Audit files in batches
  const batchSize = config.maxFiles ?? 3;
  for (let i = 0; i < Math.min(files.length, 10); i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`\nAuditing batch ${Math.floor(i / batchSize) + 1}...`);

    const fileContents: string[] = [];
    for (const file of batch) {
      const content = await readFileContent(file);
      fileContents.push(`\n\n// File: ${file}\n${content}`);
    }

    const userPrompt = `Audit these TypeScript files for semantic issues:\n${fileContents.join("\n\n")}`;

    try {
      const response = await callLLM(config, AUDIT_SYSTEM_PROMPT, userPrompt);

      // Parse JSON response - try multiple strategies
      let parsed: { issues: AuditIssue[] } | null = null;

      // Strategy 1: Direct parse if it's valid JSON
      try {
        parsed = JSON.parse(response) as { issues: AuditIssue[] };
      } catch {
        // Strategy 2: Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]) as { issues: AuditIssue[] };
          } catch {
            // Strategy 3: Try to find array of issues
            const issuesMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (issuesMatch) {
              try {
                const issues = JSON.parse(issuesMatch[0]) as AuditIssue[];
                parsed = { issues };
              } catch {
                // Give up
              }
            }
          }
        }
      }

      if (parsed?.issues) {
        console.log(`  Found ${parsed.issues.length} issues`);
        issues.push(...parsed.issues);
      } else {
        console.log(`  Warning: Could not parse response`);
      }
    } catch (error) {
      console.error(`Audit error: ${String(error)}`);
    }
  }

  return issues;
}

function printIssues(issues: AuditIssue[]): void {
  if (issues.length === 0) {
    console.log("✅ No semantic issues found");
    return;
  }

  console.log("Found issues:");
  for (const issue of issues) {
    console.log(`${issue.file}:${issue.lineStart}-${issue.lineEnd}`);
    console.log(`  [${issue.category.toUpperCase()}] ${issue.message}`);
    console.log(`  Confidence: ${issue.confidence}%`);
    console.log("");
  }
}

async function main() {
  const config = loadConfig();

  // Parse args
  const args = process.argv.slice(2);
  const isAll = args.includes("--all");
  const fileArg = args.find((a) => a.startsWith("--file="));
  const specificFile = fileArg?.replace("--file=", "");

  let files: string[];

  if (specificFile) {
    files = [specificFile];
  } else if (isAll) {
    files = getAllFiles();
  } else {
    files = getChangedFiles();
  }

  files = filterFiles(files, config);

  if (files.length === 0) {
    console.log("No files to audit");
    return;
  }

  const issues = await auditWithLLM(files, config);
  printIssues(issues);

  if (issues.length > 0 && config.severity === "error") {
    process.exit(1);
  }
}

await main();
