---
summary: "Release channels, versioning, and publishing procedures"
read_when:
  - Cutting a new release
  - Understanding release channels
  - Publishing packages
---

# Releasing

## Release Channels

| Channel    | Description                                | NPM Dist-tag |
| ---------- | ------------------------------------------ | ------------ |
| **stable** | Tagged releases (e.g., `vYYYY.M.D`)        | `latest`     |
| **beta**   | Prerelease tags (e.g., `vYYYY.M.D-beta.N`) | `beta`       |
| **dev**    | Moving head on `main`                      | N/A          |

### Beta Naming

- Prefer `-beta.N` format
- Do NOT mint new `-1/-2` betas
- Legacy formats (`vYYYY.M.D-<patch>`, `vYYYY.M.D.beta.N`) remain recognized

## Version Locations

When bumping version, update **all** of these:

| Location      | File                                                          |
| ------------- | ------------------------------------------------------------- |
| CLI           | `package.json`                                                |
| Android       | `apps/android/app/build.gradle.kts` (versionName/versionCode) |
| iOS           | `apps/ios/Sources/Info.plist` + `apps/ios/Tests/Info.plist`   |
| macOS         | `apps/macos/Sources/OpenClaw/Resources/Info.plist`            |
| Docs          | `docs/install/updating.md` (pinned npm version)               |
| macOS Release | `docs/platforms/mac/release.md`                               |

> **Note**: Do NOT change `appcast.xml` - only touch when cutting a macOS Sparkle release.

## Release Checklist

Before tagging/publishing:

```bash
node --import tsx scripts/release-check.ts
pnpm release:check
pnpm test:install:smoke
# or for non-root:
OPENCLAW_INSTALL_SMOKE_SKIP_NONROOT=1 pnpm test:install:smoke
```

## Changelog

### Rules

- User-facing changes **only** - no internal/meta notes
- Place in active version block, append to end of target section
- **Do NOT** insert at top of section

### Ordering

In each version entry:

1. `### Changes` first
2. `### Fixes` - deduped and ranked with user-facing fixes first

### Attribution

- Use at most **one** contributor mention per line
- Prefer `Thanks @author` - do NOT also add `by @author`

### Pure Test Changes

Pure test additions/fixes generally do **NOT** need changelog entries unless they alter user-facing behavior.

## Mac Release

When cutting a mac release with beta GitHub prerelease:

1. Tag from release commit: `v2026.2.15-beta.1`
2. Create prerelease with title: `openclaw 2026.2.15-beta.1`
3. Use release notes from `CHANGELOG.md` version section
4. Attach: `OpenClaw-YYYY.M.D.zip`, `OpenClaw-YYYY.M.D.dSYM.zip`
5. Include `.dmg` if available

## Additional Resources

- [docs/reference/RELEASING.md](/docs/reference/RELEASING.md) - Full releasing documentation
- [docs/platforms/mac/release.md](/docs/platforms/mac/release.md) - macOS release checklist
