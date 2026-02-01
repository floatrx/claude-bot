import TelegramBot from 'node-telegram-bot-api';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { config, validateConfig } from './config.js';

validateConfig();

const bot = new TelegramBot(config.botToken);

// File to store last message ID for cleanup
const lastMsgFile = join(tmpdir(), `claude-bot-${config.chatId}-lastmsg`);

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

async function sendMessage(message: string, withButtons: boolean) {
  // Remove previous message first
  await deletePreviousMessage();

  const sent = await bot.sendMessage(config.chatId, message, {
    parse_mode: 'HTML',
    ...(withButtons && { reply_markup: keyboard }),
  });

  // Save message ID for next cleanup
  writeFileSync(lastMsgFile, sent.message_id.toString());
}

// Parse CLI args
const args = process.argv.slice(2);
const withButtons = args.includes('--buttons');
const message = args.filter((arg) => arg !== '--buttons').join(' ') || 'Claude needs input';

sendMessage(message, withButtons)
  .then(() => {
    console.log('Message sent');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to send:', err);
    process.exit(1);
  });
