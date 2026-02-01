import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config.js';

validateConfig();

const bot = new TelegramBot(config.botToken);

const keyboard = {
  inline_keyboard: [
    [
      { text: 'Approve', callback_data: 'approve' },
      { text: 'Deny', callback_data: 'deny' },
    ],
    [
      { text: 'Skip', callback_data: 'skip' },
      { text: 'Escape', callback_data: 'escape' },
    ],
  ],
};

async function sendPermissionRequest(message: string) {
  await bot.sendMessage(config.chatId, message, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

// Get message from CLI args
const message = process.argv.slice(2).join(' ') || 'Claude needs input';

sendPermissionRequest(message)
  .then(() => {
    console.log('Message sent');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to send:', err);
    process.exit(1);
  });
