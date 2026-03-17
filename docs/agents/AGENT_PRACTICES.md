---
summary: "Agent-specific practices, multi-agent safety, and tool schemas"
read_when:
  - Working with multiple agents
  - Defining tool schemas
  - Understanding agent behavior patterns
---

# Agent Practices

## Multi-Agent Safety

### Do NOT

- **DO NOT** create/apply/drop `git stash` entries unless explicitly requested
  - This includes `git pull --rebase --autostash`
  - Assume other agents may be working
  - Keep unrelated WIP untouched

- **DO NOT** create/remove/modify `git worktree` checkouts unless explicitly requested
  - Don't edit `.worktrees/*`

- **DO NOT** switch branches / check out a different branch unless explicitly requested

### Do

- **DO** run multiple agents as long as each agent has its own session
- **DO** focus reports on your edits
- **DO** avoid guard-rail disclaimers unless truly blocked

### When User Says "Push"

- You may `git pull --rebase` to integrate latest changes
- Never discard other agents' work

### When User Says "Commit"

- Scope to your changes only

### When User Says "Commit All"

- Commit everything in grouped chunks

## Lint/Format Churn

- If staged+unstaged diffs are formatting-only, auto-resolve without asking
- If commit/push already requested, auto-stage formatting-only follow-ups
- Only ask when changes are semantic (logic/data/behavior)

## Tool Schema Guardrails

### Avoid in Tool Input Schemas

- **DO NOT** use `Type.Union` - use `stringEnum` / `optionalStringEnum`
- **DO NOT** use `anyOf` / `oneOf` / `allOf`
- Use `Type.Optional(...)` instead of `... | null`

### Schema Structure

```typescript
// ✅ Good
{
  type: "object",
  properties: {
    status: { type: "string", enum: ["active", "inactive"] },
    name: { type: "string" },
  },
}

// ❌ Bad
{
  type: "object",
  properties: {
    status: { anyOf: [...] },
  },
}
```

### Format Property

Avoid raw `format` property names in tool schemas - some validators treat `format` as reserved keyword.

## Session Files

When asked to open a "session" file:

- Open Pi session logs under `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
- Use the `agent=<id>` value in the Runtime line of the system prompt
- Read newest unless a specific ID is given
- **NOT** the default `sessions.json`

## Vocabulary

- "makeup" = "mac app"

## Node Modules

- **NEVER** edit `node_modules` (global/Homebrew/npm/git installs too)
- Updates overwrite local changes
- Skill notes go in `tools.md` or `AGENTS.md`

## AGENTS.md in Subdirectories

When adding a new `AGENTS.md` anywhere in the repo, also add a `CLAUDE.md` symlink:

```bash
ln -s AGENTS.md CLAUDE.md
```

## Answering Questions

- Respond with high-confidence answers only
- **Verify in code** - do not guess

## Bug Investigations

- Read source code of relevant npm dependencies AND all related local code
- Aim for high-confidence root cause before concluding
