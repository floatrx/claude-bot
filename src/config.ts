import 'dotenv/config';

export const config = {
  botToken: process.env.TG_CLAUDE_BOT_TOKEN || '',
  chatId: process.env.TG_CHAT_ID || '',
  tmuxSession: process.env.TMUX_SESSION || 'claude',
};

export function validateConfig() {
  if (!config.botToken) {
    console.error('Error: TG_CLAUDE_BOT_TOKEN is required');
    process.exit(1);
  }
  if (!config.chatId) {
    console.error('Error: TG_CHAT_ID is required');
    process.exit(1);
  }
}
