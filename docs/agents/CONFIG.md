---
summary: "Runtime configuration, build commands, and environment setup"
read_when:
  - Setting up development environment
  - Running builds
  - Configuring runtime
---

# Configuration & Build

## Prerequisites

- **Runtime**: Node **22+**
- **Package Manager**: pnpm (preferred), also supports Bun

## Install Dependencies

```bash
pnpm install
# or
bun install
```

> Keep `pnpm-lock.yaml` + Bun patching in sync when touching deps/patches.

## Development Commands

```bash
pnpm dev              # Run CLI in dev mode
pnpm openclaw ...     # Alias for dev

pnpm build           # Type-check/build
pnpm tsgo            # TypeScript checks only

pnpm check           # Lint + format check
pnpm format          # Format check (oxfmt --check)
pnpm format:fix      # Format fix (oxfmt --write)
```

## Pre-commit Hooks

```bash
prek install
```

Runs same checks as CI.

## Build Commands

```bash
# Full build
pnpm build

# Type-check
pnpm tsgo
```

## Testing

```bash
pnpm test            # Run tests
pnpm test:coverage   # With coverage
```

## macOS App

### Dev Packaging

```bash
scripts/package-mac-app.sh
```

- Defaults to current arch
- See [docs/platforms/mac/release.md](/docs/platforms/mac/release.md) for release checklist

## Version Locations

| Component | Location                                           |
| --------- | -------------------------------------------------- |
| CLI       | `package.json`                                     |
| Android   | `apps/android/app/build.gradle.kts`                |
| iOS       | `apps/ios/Sources/Info.plist`                      |
| macOS     | `apps/macos/Sources/OpenClaw/Resources/Info.plist` |
| Docs      | `docs/install/updating.md`                         |

## CLI Progress

Use `src/cli/progress.ts`:

- `osc-progress` + `@clack/prompts` spinner
- **DON'T** hand-roll spinners/bars

## Status Output

- Use `src/terminal/table.ts` for tables + ANSI-safe wrapping
- `status --all` = read-only/pasteable
- `status --deep` = probes

## Connection Providers

When adding a new connection, update **every** UI surface:

- macOS app
- Web UI
- Mobile (if applicable)
- Onboarding/overview docs
- Add matching status + configuration forms

## Release Guardrails

- **DO NOT** change version numbers without operator's explicit consent
- Always ask permission before running npm publish/release

### Beta Release

- When using beta Git tag (e.g., `v2026.2.15-beta.1`)
- Publish npm with matching beta version suffix (e.g., `2026.2.15-beta.1`)
- **NOT** plain version on `--tag beta` (blocks the plain version)

## Release Signing/Notary

- Keys managed outside repo
- Follow internal release docs
- Expected env vars:
  - `APP_STORE_CONNECT_ISSUER_ID`
  - `APP_STORE_CONNECT_KEY_ID`
  - `APP_STORE_CONNECT_API_KEY_P8`
