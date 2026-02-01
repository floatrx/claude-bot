import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config.js';
import { approve, deny, skip, escape, sendText } from './terminal.js';

validateConfig();

const bot = new TelegramBot(config.botToken, { polling: true });

console.log('Bot started. Listening for commands...');

// Action handlers
const actions: Record<string, () => Promise<boolean>> = {
  approve,
  deny,
  skip,
  escape,
};

// Handle button callbacks
bot.on('callback_query', async (query) => {
  const action = query.data;
  if (!action || !query.message) return;

  const handler = actions[action];
  if (handler) {
    const success = await handler();
    await bot.answerCallbackQuery(query.id, {
      text: success ? `${action} sent` : `Failed to ${action}`,
    });

    // Remove buttons after action
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
      }
    );
  }
});

// Handle text messages as direct input
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Skip commands

  if (msg.text && msg.chat.id.toString() === config.chatId) {
    await sendText(msg.text);
    await bot.sendMessage(msg.chat.id, `Sent: ${msg.text}`);
  }
});

// /start command
bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    `👋 <b>Claude Bot</b>\n\nRemote control for Claude Code via Telegram.\n\n<b>Commands:</b>\n/y — Approve action\n/n — Deny action\n/ping — Check if bot is alive`,
    { parse_mode: 'HTML' }
  );
});

// /ping command
bot.onText(/\/ping/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'pong');
});

// /approve command
bot.onText(/\/y/, async (msg) => {
  await approve();
  await bot.sendMessage(msg.chat.id, 'Approved');
});

// /deny command
bot.onText(/\/n/, async (msg) => {
  await deny();
  await bot.sendMessage(msg.chat.id, 'Denied');
});

// Export for external use
export { bot };
