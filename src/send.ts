import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config.js';

validateConfig();

const bot = new TelegramBot(config.botToken);

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

async function sendMessage(message: string, withButtons: boolean) {
  await bot.sendMessage(config.chatId, message, {
    parse_mode: 'HTML',
    ...(withButtons && { reply_markup: keyboard }),
  });
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
