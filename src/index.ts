import TelegramBot from 'node-telegram-bot-api';

import { config, validateConfig } from './config.js';
import { approve, deny, escape, sendText, skip } from './terminal.js';

validateConfig();

const bot = new TelegramBot(config.botToken, { polling: true });

console.log('Bot started. Listening for commands...');

// Owner check helper
const isOwner = (chatId: number) => chatId.toString() === config.chatId;

const rejectUnauthorized = async (chatId: number) => {
  await bot.sendMessage(chatId, '🔒 This bot is private and available only for the owner.');
};

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

  // Owner check
  if (!isOwner(query.message.chat.id)) {
    await bot.answerCallbackQuery(query.id, { text: 'Unauthorized' });
    return;
  }

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

  // Owner check
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }

  if (msg.text) {
    await sendText(msg.text);
    await bot.sendMessage(msg.chat.id, `Sent: ${msg.text}`);
  }
});

// /start command
bot.onText(/^\/start$/, async (msg) => {
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }
  await bot.sendMessage(msg.chat.id, `👋 <b>Claude Bot</b>\n\nRemote control for Claude Code via Telegram.`, {
    parse_mode: 'HTML',
  });
});

// /ping command
bot.onText(/^\/ping$/, async (msg) => {
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }
  await bot.sendMessage(msg.chat.id, 'pong');
});

// /approve command
bot.onText(/^\/y$/, async (msg) => {
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }
  await approve();
  await bot.sendMessage(msg.chat.id, 'Approved');
});

// /deny command
bot.onText(/^\/n$/, async (msg) => {
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }
  await deny();
  await bot.sendMessage(msg.chat.id, 'Denied');
});

// /clean command - delete recent messages
bot.onText(/^\/clean$/, async (msg) => {
  if (!isOwner(msg.chat.id)) {
    await rejectUnauthorized(msg.chat.id);
    return;
  }

  const chatId = msg.chat.id;
  const currentMsgId = msg.message_id;
  let deleted = 0;

  // Delete messages in batches (Telegram allows deleting messages < 48h old)
  for (let i = currentMsgId; i > currentMsgId - 100; i--) {
    try {
      await bot.deleteMessage(chatId, i);
      deleted++;
    } catch {
      // Message doesn't exist or can't be deleted, skip
    }
  }

  // Send confirmation (will be the only message left)
  await bot.sendMessage(chatId, `🧹 Cleaned ${deleted} messages`);
});

// Export for external use
export { bot };
