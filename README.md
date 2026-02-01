# Claude Bot

Remote control for Claude Code via Telegram. Handle permission prompts and idle states from your phone.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Claude Code    │────▶│  Telegram Bot    │────▶│  Your Phone     │
│  (in tmux)      │◀────│  (on your Mac)   │◀────│  (click button) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Setup

### 1. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`, follow prompts
3. Save the bot token

### 2. Get Your Chat ID

Send any message to your bot, then:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

Find `"chat":{"id": YOUR_CHAT_ID}` in the response.

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Install & Run

```bash
pnpm install
pnpm dev   # Development with hot reload
```

### 5. Run Claude in tmux

Add to `~/.zshrc`:

```bash
alias claude='tmux new-session -A -s claude -c "$(pwd)" claude'
```

Now `claude` command automatically runs in tmux.

## Usage

### Bot Commands

| Command | Action |
|---------|--------|
| `/y` | Approve (send "y" + Enter) |
| `/n` | Deny (send "n" + Enter) |
| `/ping` | Check if bot is running |
| Any text | Send as input to terminal |

### Inline Buttons

When receiving a permission request, tap:
- **Approve** - sends `y` + Enter
- **Deny** - sends `n` + Enter
- **Skip** - sends `s` + Enter
- **Escape** - sends Escape key

### Send from Claude Code Hook

```bash
# In your hook script
pnpm --prefix ~/Projects/Floatrx/claude-bot send "Permission required: $MESSAGE"
```

## Integration with Claude Code Hooks

Update `~/.claude/settings.json` to trigger notifications:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm --prefix ~/Projects/Floatrx/claude-bot send \"Claude needs permission\""
          }
        ]
      }
    ]
  }
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled version |
| `pnpm send` | Send message with buttons |
