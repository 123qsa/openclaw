---
summary: "GitHub practices, PR workflows, and issue management"
read_when:
  - Working with issues and PRs
  - Creating commits
  - Using GitHub search
---

# GitHub Practices

## File References

In chat replies, file references must be **repo-root relative only**:

```
✅ extensions/bluebubbles/src/channel.ts:80
❌ /Users/ray/Desktop/project/openclaw/...
❌ ~/...
```

## Issues & PR Comments

- Use literal multiline strings or `-F - <<'EOF'` (or `$'...'`) for real newlines
- **NEVER** embed `"\\n"` in command arguments

### Footgun to Avoid

**NEVER** use `gh issue/pr comment -b "..."` when body contains backticks or shell chars:

```bash
# ❌ Bad - escaping issues
gh issue comment -b "Fixed in `commit`"

# ✅ Good - heredoc
gh issue comment -F - <<'EOF'
Fixed in `commit`
EOF
```

## Issue/PR Linking

- **DON'T** wrap issue/PR refs like `#24643` in backticks when you want auto-linking
- Use plain `#24643` (optionally add full URL)

## PR Landing Comments

- Always make commit SHAs clickable with full commit links
- Include both landed SHA + source SHA when present

## PR Review Conversations

- If a bot leaves review conversations on your PR, address them and resolve once fixed
- Leave conversation unresolved **only** when reviewer/maintainer judgment is still needed
- **DON'T** leave bot-conversation cleanup to maintainers

## GitHub Searching

- **DON'T** limit to first 500 issues or PRs when searching all
- Keep going until you've reached the last page
- Use `--match title,body` first
- Add `--match comments` for triaging follow-up threads

### Search Examples

```bash
# PRs
gh search prs --repo openclaw/openclaw --match title,body --limit 50 -- "auto-update"

# Issues
gh search issues --repo openclaw/openclaw --match title,body --limit 50 -- "auto-update"

# Structured output
gh search issues --repo openclaw/openclaw --match title,body --limit 50 \
  --json number,title,state,url,updatedAt \
  -- "auto update" \
  --jq '.[] | "\(.number) | \(.state) | \(.title) | \(.url)"'
```

## Auto-close Labels

Apply these labels and let `.github/workflows/auto-response.yml` handle:

| Label                      | Use For                                     |
| -------------------------- | ------------------------------------------- |
| `r: skill`                 | Close with guidance to publish on Clawhub   |
| `r: support`               | Redirect to Discord support + stuck FAQ     |
| `r: no-ci-pr`              | Close test-fix-only PRs for failing main CI |
| `r: too-many-prs`          | When author exceeds active PR limit         |
| `r: testflight`            | Requests for TestFlight access              |
| `r: third-party-extension` | Ship as third-party plugin                  |
| `r: moltbook`              | Off-topic (not affiliated)                  |
| `r: spam`                  | Spam (also lock)                            |
| `invalid`                  | Invalid items                               |
| `dirty`                    | PRs with too many unrelated changes         |

## PR Workflow

See `.agents/skills/PR_WORKFLOW.md` for full maintainer workflow:

- Triage order
- Quality bar
- Rebase rules
- Commit/changelog conventions
- Co-contributor policy
- `review-pr` > `prepare-pr` > `merge-pr` pipeline

## Commit Guidelines

Use `scripts/committer` for commits:

```bash
scripts/committer "<msg>" <file...>
```

- Follow concise, action-oriented messages: `CLI: add verbose flag to send`
- Group related changes
- Avoid bundling unrelated refactors

## Additional Resources

- [.github/pull_request_template.md](/.github/pull_request_template.md) - PR submission template
- [.github/ISSUE_TEMPLATE/](/.github/ISSUE_TEMPLATE/) - Issue templates
