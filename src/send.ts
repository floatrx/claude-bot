import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { config, validateConfig } from './config.js';
import { isSessionAvailable } from './terminal.js';

validateConfig();

const bot = new TelegramBot(config.botToken);

// File to store last message ID for cleanup (in project root)
const __dirname = dirname(fileURLToPath(import.meta.url));
const lastMsgFile = join(__dirname, '..', '.lastmsg');

const keyboard = {
  inline_keyboard: [
    [
      { text: '✅ Approve', callback_data: 'approve' },
      { text: '❌ Deny', callback_data: 'deny' },
    ],
    [
      { text: '⏭️ Skip', callback_data: 'skip' },
      { text: '🚪 Escape', callback_data: 'escape' },
    ],
  ],
};

async function deletePreviousMessage() {
  if (!existsSync(lastMsgFile)) return;

  try {
    const lastMsgId = parseInt(readFileSync(lastMsgFile, 'utf-8').trim(), 10);
    if (lastMsgId) {
      await bot.deleteMessage(config.chatId, lastMsgId);
    }
  } catch {
    // Message may already be deleted or doesn't exist
  } finally {
    unlinkSync(lastMsgFile);
  }
}

async function sendTypingIndicator() {
  await bot.sendChatAction(config.chatId, 'typing');
}

async function sendMessage(message: string, withButtons: boolean) {
  // Remove previous message first
  await deletePreviousMessage();

  // Only show buttons if tmux session is active
  const showButtons = withButtons && (await isSessionAvailable());

  const sent = await bot.sendMessage(config.chatId, message, {
    parse_mode: 'HTML',
    ...(showButtons && { reply_markup: keyboard }),
  });

  // Save message ID for next cleanup
  writeFileSync(lastMsgFile, sent.message_id.toString());
}

// Parse CLI args
const args = process.argv.slice(2);
const typingOnly = args.includes('--typing');
const withButtons = args.includes('--buttons');
const message = args.filter((arg) => !arg.startsWith('--')).join(' ') || 'Claude needs input';

if (typingOnly) {
  sendTypingIndicator()
    .then(() => {
      console.log('Typing indicator sent');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to send typing:', err);
      process.exit(1);
    });
} else {
  sendMessage(message, withButtons)
    .then(() => {
      console.log('Message sent');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to send:', err);
      process.exit(1);
    });
}
