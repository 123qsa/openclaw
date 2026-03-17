---
summary: "Testing guidelines, coverage requirements, and test execution"
read_when:
  - Writing tests
  - Running tests locally
  - Understanding test coverage requirements
---

# Testing

## Framework

- **Framework**: Vitest with V8 coverage thresholds
- **Coverage**: 70% lines/branches/functions/statements

## Test Files

- **Unit tests**: Colocated `*.test.ts` next to source files
- **E2E tests**: `*.e2e.test.ts`

## Running Tests

```bash
pnpm test                  # Run all tests
pnpm test:coverage         # Run with coverage report
```

### Low Memory Profile

If local Vitest runs cause memory pressure (common on non-Mac-Studio hosts):

```bash
OPENCLAW_TEST_PROFILE=low OPENCLAW_TEST_SERIAL_GATEWAY=1 pnpm test
```

### Workers

- **Do NOT** set test workers above 16; already tried and it's not better.

## Live Tests (Real Keys)

```bash
# OpenClaw-only live tests
CLAWDBOT_LIVE_TEST=1 pnpm test:live

# Includes provider live tests
LIVE=1 pnpm test:live

# Docker tests
pnpm test:docker:live-models
pnpm test:docker:live-gateway

# Onboarding Docker E2E
pnpm test:docker:onboard
```

## Pre-commit

Run tests before pushing:

```bash
pnpm test
```

## Additional Resources

- [docs/testing.md](/docs/testing.md) - Full testing kit and what's covered

## Mobile Testing

- Before using a simulator, check for connected real devices (iOS + Android)
- **Prefer real devices** when available
