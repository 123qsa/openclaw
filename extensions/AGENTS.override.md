# AGENTS.override.md - Extensions

This file overrides parent AGENTS.md rules for the `extensions/` directory.

## Overrides

### Installation

- **Use** `pnpm install --omit=dev` instead of `pnpm install`
- This runs `npm install --omit=dev` in each plugin directory

### Dependencies

- **Plugin deps** must stay in the plugin's own `package.json`
- **DO NOT** add plugin-only deps to root `package.json` unless core uses them

### Workspace Dependencies

- **AVOID** `workspace:*` in `dependencies` (breaks npm install)
- **PUT** `openclaw` in `devDependencies` or `peerDependencies` instead
- Runtime resolves `openclaw/plugin-sdk` via jiti alias

## Local Rules

### Plugin Structure

```
extensions/<name>/
├── package.json      # Keep plugin deps here
├── src/              # Source code
└── SKILL.md         # Skill definition (if applicable)
```

### Publishing

- See [docs/reference/RELEASING.md](/docs/reference/RELEASING.md) for plugin release fast path
- Release only already-on-npm plugins
- See "Current npm plugin list" in docs

## Context

When working in this directory, also read:

- [docs/agents/ARCHITECTURE.md](/docs/agents/ARCHITECTURE.md) - For plugin architecture
- [docs/agents/CODING.md](/docs/agents/CODING.md) - For coding standards
