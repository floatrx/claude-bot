# claude-bot — Remote Control for Claude Code

## Problem
Claude Code needs permission approvals while working. When AFK — notifications missed, workflow blocked.

## Solution
Telegram bot for remote notifications and control from phone.

## Features
- Real-time Telegram notifications
- Action buttons: ✅ Approve / ❌ Deny / ⏭️ Skip / 🚪 Escape
- Commands: `/y` `/n` `/ping` `/clean`
- Owner-only protection
- PM2 daemon with auto-restart

## Stack
Node.js, TypeScript, PM2

---

## Setup Guide

### 1. Create Telegram Bot
- Open [@BotFather](https://t.me/BotFather) → `/newbot`
- Save the token

### 2. Get Your Chat ID
- Open [@userinfobot](https://t.me/userinfobot) → `/start`
- Copy your ID

### 3. Clone & Configure
```bash
git clone [ask Andrew for repo]
cd claude-bot
cp .env.example .env
```

Edit `.env`:
```
TG_CLAUDE_BOT_TOKEN=your-token
OWNER_CHAT_ID=your-chat-id
TMUX_SESSION=claude
```

### 4. Install & Run
```bash
pnpm install
pnpm add -g pm2
pnpm pm2
```

### 5. Configure Claude Hooks

Edit `~/.claude/settings.json`:
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/tg-notify.sh"
      }]
    }]
  }
}
```

### 6. Create Hook Script

Create `~/.claude/tg-notify.sh` — ask Andrew for the script.

---

## Usage

| Command | Action |
|---------|--------|
| `/y` | Approve |
| `/n` | Deny |
| `/ping` | Check bot |
| `/clean` | Clear chat |

Or use action buttons when notification arrives.

---

✅ **Done!** Now you'll get Telegram notifications when Claude needs input.
