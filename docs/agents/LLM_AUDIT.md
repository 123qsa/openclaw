---
summary: "LLM Audit Dual-track System - combining deterministic linter with LLM-based semantic auditing"
read_when:
  - Running semantic code audits
  - Understanding code quality gates
  - Reviewing design pattern compliance
---

# LLM Audit Dual-track System

## Overview

This project uses a dual-track code audit system:

| Track             | Tool      | What it catches                                                         |
| ----------------- | --------- | ----------------------------------------------------------------------- |
| **Deterministic** | oxlint    | Syntax errors, type violations, performance issues, suspicious patterns |
| **Semantic**      | LLM Audit | Code intent, design patterns, business logic, architecture boundaries   |

## Why Dual-track?

oxlint catches **what's wrong** (syntax, types, performance). LLM Audit catches **what's wrong semantically**:

- Does the code match its documented intent?
- Are design patterns applied consistently?
- Are there security issues beyond static analysis?
- Is business logic being followed correctly?
- Are architecture boundaries respected?

## Running LLM Audit

### Quick Audit

```bash
pnpm llm:audit                    # Audit changed files
pnpm llm:audit --all              # Audit all files
pnpm llm:audit --file src/commands # Audit specific path
```

### Full Check (oxlint + LLM)

```bash
pnpm check                        # oxlint + typecheck
pnpm check:full                   # oxlint + typecheck + LLM audit
```

## Audit Categories

### 1. Intent Verification

- Code matches comments/docstrings
- Function behavior matches name
- Variable names reflect usage

### 2. Design Patterns

- Consistent use of established patterns (factory, observer, strategy)
- No anti-patterns introduced
- Proper separation of concerns

### 3. Business Logic

- API contracts honored
- Error handling consistency
- State management correctness

### 4. Architecture Boundaries

- No unauthorized cross-layer imports
- Extension points used correctly
- Plugin isolation maintained

### 5. Security (LLM-specific)

- Logic bugs that static analysis misses
- Input validation completeness
- Credential handling patterns

## Configuration

LLM Audit is configured in `.llm-auditrc.json`:

```json
{
  "model": "claude-sonnet-4-20250514",
  "categories": ["intent", "patterns", "security"],
  "exclude": ["dist/", "node_modules/"],
  "severity": "warning"
}
```

## Output Format

```
src/commands/send.ts:45-52
  [ INTENT ] Function 'formatMessage' does more than formatting - consider renaming
  Confidence: 85%

src/infra/db.ts:120-135
  [ SECURITY ] SQL query constructed with string concatenation - use parameterized query
  Confidence: 95%
```

## CI Integration

LLM Audit runs in CI on PRs affecting:

- Core business logic (`src/commands/`, `src/infra/`)
- Security-sensitive areas (`src/auth/`, `src/payments/`)
- Architecture boundaries

## When to Ignore

- Generated code (`.gen.ts`, `dist/`)
- Third-party vendor code
- Explicit architectural compromises (documented in `AUDIT_EXCEPTIONS.md`)
