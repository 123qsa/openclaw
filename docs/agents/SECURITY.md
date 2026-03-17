---
summary: "Security practices, credential handling, and trust model"
read_when:
  - Handling credentials or secrets
  - Understanding security boundaries
  - Processing security advisories
---

# Security

## Credential Storage

- Web provider stores credentials at `~/.openclaw/credentials/`
- Rerun `openclaw login` if logged out

## Session Storage

- Pi sessions live under `~/.openclaw/sessions/` by default
- The base directory is **not** configurable

## Secrets & Sensitive Data

- **NEVER** commit or publish real phone numbers, videos, or live configuration values
- Use obviously fake placeholders in docs, tests, and examples

## Environment Variables

- See `~/.profile` for environment variables

## Trust Model

Before triage/severity decisions on security issues, read `SECURITY.md` to align with OpenClaw's trust model and design boundaries.

## GHSA (Security Advisories)

When handling GitHub security advisories:

1. Read `SECURITY.md` first
2. Fetch: `gh api /repos/openclaw/openclaw/security-advisories/<GHSA>`
3. Check for private fork PRs that must be closed

### Publishing GHSA Patches

```bash
# Build patch JSON
jq -n --rawfile desc /tmp/ghsa.desc.md \
  '{summary,severity,description:$desc,vulnerabilities:[...]}' \
  > /tmp/ghsa.patch.json

# Publish (note: cannot set severity + cvss_vector_string together)
gh api -X PATCH /repos/openclaw/openclaw/security-advisories/<GHSA> \
  --input /tmp/ghsa.patch.json
```

## Troubleshooting

- Rebrand/migration issues or legacy config/service warnings: run `openclaw doctor`
- See [docs/gateway/doctor.md](/docs/gateway/doctor.md)

## Additional Resources

- [SECURITY.md](/SECURITY.md) - Full trust model and security boundaries
- [docs/auth-credential-semantics.md](/docs/auth-credential-semantics.md) - Credential semantics
- [docs/reference/secretref-credential-surface.md](/docs/reference/secretref-credential-surface.md) - Secret reference
