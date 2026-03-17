# Repository Guidelines

- Repo: https://github.com/openclaw/openclaw
- In chat replies, file references must be repo-root relative only (example: `extensions/bluebubbles/src/channel.ts:80`); never absolute paths or `~/...`.

## Progressive Documentation Disclosure

This project uses progressive documentation disclosure. Agent does not need to know everything at task start - like human engineers, it needs an onboarding process and on-demand context retrieval.

### Start Here

- **First read**: [docs/agents/ARCHITECTURE.md](docs/agents/ARCHITECTURE.md) - Project structure and module organization

### Development Guides

- **Coding**: [docs/agents/CODING.md](docs/agents/CODING.md) - Code style, TypeScript rules, file organization
- **Testing**: [docs/agents/TESTING.md](docs/agents/TESTING.md) - Test framework, coverage, running tests
- **Building**: [docs/agents/CONFIG.md](docs/agents/CONFIG.md) - Build commands, environment setup

### Workflow & Process

- **Releasing**: [docs/agents/RELEASING.md](docs/agents/RELEASING.md) - Version management, publishing
- **GitHub**: [docs/agents/GITHUB.md](docs/agents/GITHUB.md) - Issues, PRs, commits

### Safety & Compliance

- **Security**: [docs/agents/SECURITY.md](docs/agents/SECURITY.md) - Credentials, trust model
- **Agent Practices**: [docs/agents/AGENT_PRACTICES.md](docs/agents/AGENT_PRACTICES.md) - Multi-agent safety, tool schemas

### Integrations

- **External Services**: [docs/agents/INTEGRATIONS.md](docs/agents/INTEGRATIONS.md) - 1Password, exe.dev, SSH, macOS

## Quick Reference

- [docs/concepts/](/docs/concepts/) - Core concepts (agent, session, context)
- [docs/reference/](/docs/reference/) - Reference documentation
- [docs/channels/](/docs/channels/) - Channel documentation
- [docs/cli/](/docs/cli/) - CLI command reference

## PR Workflow

- Full maintainer workflow: see `.agents/skills/PR_WORKFLOW.md`
- `/landpr` process: see global Codex prompts (`~/.codex/prompts/landpr.md`)

## Auto-close Labels

Apply `r:*` labels and let `.github/workflows/auto-response.yml` handle: `r: skill`, `r: support`, `r: no-ci-pr`, `r: too-many-prs`, `r: testflight`, `r: third-party-extension`, `r: moltbook`, `r: spam`, `invalid`, `dirty`.

## PR Truthfulness

- Never merge bug-fix PRs based only on issue/PR text or AI rationale
- Require explicit evidence: symptom evidence, verified root cause, fix verification, regression test
