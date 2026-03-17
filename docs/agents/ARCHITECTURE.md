---
summary: "Project structure, module organization, and architecture patterns"
read_when:
  - Understanding the codebase layout
  - Working with channel implementations
  - Adding new features or modules
---

# Architecture

## Source Code Layout

```
src/                    # Main source code
├── cli/               # CLI wiring and entry points
├── commands/         # CLI commands implementation
├── provider-web.ts   # Web provider
├── infra/            # Infrastructure code
├── media/            # Media pipeline
├── channels/         # Channel adapters (core)
├── telegram/          # Telegram channel
├── discord/           # Discord channel
├── slack/             # Slack channel
├── signal/            # Signal channel
├── imessage/          # iMessage channel
├── web/               # WhatsApp web
└── routing/           # Message routing
```

## Extensions (Plugins)

Extensions live under `extensions/*` as workspace packages:

```
extensions/
├── bluebubbles/      # BlueBubbles iMessage
├── msteams/          # Microsoft Teams
├── matrix/           # Matrix
├── zalo/             # Zalo
├── zalouser/         # Zalo User
└── voice-call/       # Voice call
```

## Tests

- Colocated `*.test.ts` next to source files
- E2E tests: `*.e2e.test.ts`

## Documentation

- `docs/` - User-facing documentation (Mintlify)
- Built output: `dist/`

## Additional Resources

- [docs/concepts/architecture.md](/docs/concepts/architecture.md) - Deep dive into system architecture
- [docs/concepts/](/docs/concepts/) - Core concepts (agent, session, context, etc.)
- [docs/channels/](/docs/channels/) - Channel-specific documentation
- [docs/cli/](/docs/cli/) - CLI command reference

## Key Architectural Principles

### 1. Channel Abstraction

All messaging channels follow a common interface. When modifying shared logic (routing, allowlists, pairing, command gating, onboarding), consider **all** built-in + extension channels.

### 2. Plugin Architecture

- Keep plugin-only dependencies in the extension's `package.json`
- Do NOT add plugin deps to root `package.json` unless core uses them
- Install runs `npm install --omit=dev` in plugin dir
- Runtime deps must live in `dependencies`
- Avoid `workspace:*` in `dependencies` (breaks npm install)
- Put `openclaw` in `devDependencies` or `peerDependencies` instead

### 3. Lazy Loading Boundaries

When needing dynamic imports, create dedicated `*.runtime.ts` boundaries:

```typescript
// ❌ Don't mix dynamic and static imports
import { foo } from "x";
await import("x");

// ✅ Use a boundary
// x.runtime.ts - re-exports from x
// Then dynamically import x.runtime.ts from lazy callers only
```

### 4. Installers

Installers served from `https://openclaw.ai/*` live in the sibling repo `../openclaw.ai`:

- `public/install.sh`
- `public/install-cli.sh`
- `public/install.ps1`
