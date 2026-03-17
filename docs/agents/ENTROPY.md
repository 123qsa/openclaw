---
summary: "Entropy Management - Automated rule system maintenance and cleanup"
read_when:
  - Running rule cleanup
  - Understanding rule decay prevention
  - Setting up automated maintenance
---

# Entropy Management

## Overview

As the codebase evolves, lint rules, configurations, and coding standards can become stale, conflicting, or outdated. Entropy Management is an automated system that regularly cleans up and maintains the rule ecosystem.

## What Gets Maintained

| Category             | Examples                           |
| -------------------- | ---------------------------------- |
| **Dead Rules**       | Unused oxlint rules, stale ignores |
| **Duplicate Checks** | Redundant lint patterns            |
| **Orphaned Configs** | Unreferenced config files          |
| **Outdated Docs**    | Deprecated patterns in AGENTS.md   |
| **Unused Aliases**   | Stale command aliases              |
| **Deprecations**     | Old API usages in configs          |

## Running Cleanup

### Manual Cleanup

```bash
pnpm entropy:cleanup           # Quick cleanup (dry run)
pnpm entropy:cleanup --fix     # Apply fixes
pnpm entropy:cleanup --deep    # Deep analysis
```

### Scheduled Cleanup

```bash
# Set up weekly cron (via Claude Code)
/loop 7d /entropy:cleanup --fix
```

## Cleanup Categories

### 1. Dead Code Detection

- Unused functions in scripts
- Orphaned test files
- Dead branches in configs

### 2. Configuration Entropy

- Duplicate entries in `.oxlintrc.json`
- Conflicting ignore patterns
- Outdated schema references

### 3. Documentation Drift

- Broken internal links
- Outdated command references
- Deprecated terminology

### 4. Import Rot

- Unused imports
- Broken module references
- Stale workspace deps

## Output Format

```
🔧 Entropy Cleanup Report
==========================

Dead Code:
  src/scripts/deprecated.ts - unused
  .oxlintrc.json:23 - duplicate rule

Config Drift:
  docs/agents/ARCHITECTURE.md - broken link to removed file

Total: 3 issues found (2 auto-fixable)
```

## CI Integration

Entropy cleanup runs in CI weekly or on-demand:

```yaml
# .github/workflows/entropy.yml
on:
  schedule: [cron: "0 0 * * 0"] # Weekly
  workflow_dispatch:
```

## Auto-fix Categories

These issues are auto-fixable:

- Unused imports
- Duplicate config entries
- Broken doc links
- Orphaned ignore patterns

These require manual review:

- Deprecated patterns
- Architecture changes
- Breaking config changes
