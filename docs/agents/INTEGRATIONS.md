---
summary: "Third-party integrations: 1Password, exe.dev, SSH, macOS"
read_when:
  - Working with external services
  - Setting up deployments
  - Managing secrets for releases
---

# Integrations

## 1Password (NPM Publishing)

All `op` commands must run inside a fresh tmux session:

```bash
tmux new -d -s release-$(date +%Y%m%d-%H%M%S)
eval "$(op signin --account my.1password.com)"
```

### NPM Auth

- Correct 1Password path: `op://Private/Npmjs`
- OTP: `op read 'op://Private/Npmjs/one-time password?attribute=otp'`

### Publish

```bash
npm publish --access public --otp="<otp>"
```

### Verify

```bash
npm view openclaw version --userconfig "$(mktemp)"
```

## exe.dev (VM Operations)

### Access

```bash
ssh exe.dev
ssh vm-name
```

- Assume SSH key already set
- If SSH flaky, use exe.dev web terminal or Shelley (web agent)

### Update OpenClaw

```bash
sudo npm i -g openclaw@latest
```

### Configuration

```bash
openclaw config set ...  # Ensure gateway.mode=local
```

### Discord Token

- Store raw token only (no `DISCORD_BOT_TOKEN=` prefix)

### Restart Gateway

```bash
pkill -9 -f openclaw-gateway || true
nohup openclaw gateway run --bind loopback --port 18789 --force \
  > /tmp/openclaw-gateway.log 2>&1 &
```

### Verify

```bash
openclaw channels status --probe
ss -ltnp | rg 18789
tail -n 120 /tmp/openclaw-gateway.log
```

## macOS

### Gateway

- Currently runs only as the menubar app
- **No** separate LaunchAgent/helper label installed
- Restart via OpenClaw Mac app or `scripts/restart-mac.sh`

### Kill/Verify

```bash
launchctl print gui/$UID | grep openclaw
```

> **Debugging**: Start/stop gateway via the app, not ad-hoc tmux sessions.

### Logs

```bash
./scripts/clawlog.sh
```

- Uses passwordless sudo for `/usr/bin/log`
- Supports follow/tail/category filters

### State Management

- Prefer `Observation` framework (`@Observable`, `@Bindable`)
- **DON'T** introduce new `ObservableObject` unless required for compatibility

### Rebuilding

- **DO NOT** rebuild macOS app over SSH
- Rebuilds must run directly on the Mac

## Signal (Fly.io)

```bash
fly ssh console -a flawd-bot -C "bash -lc 'cd /data/clawd/openclaw && git pull --rebase origin main'"
fly machines restart e825232f34d058 -a flawd-bot
```

## Voice Wake Forwarding

Command template:

```bash
openclaw-mac agent --message "${text}" --thinking low
```

- `VoiceWakeForwarder` already shell-escapes `${text}`
- Don't add extra quotes

### launchd PATH

- launchd PATH is minimal
- Ensure launch agent PATH includes `$HOME/Library/pnpm` so binaries resolve
