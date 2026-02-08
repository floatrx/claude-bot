import TelegramBot from 'node-telegram-bot-api';

import { config, validateConfig } from './config.js';
import { approve, deny, escape, isSessionAvailable, sendText, skip } from './terminal.js';

validateConfig();

const bot = new TelegramBot(config.botToken, { polling: true });

console.log('Bot started. Listening for commands...');

// Owner guard - silently ignore non-owner messages
const isOwner = (chatId: number) => chatId.toString() === config.chatId;

// Response helper
const reply = (chatId: number, success: boolean, successMsg: string) =>
  bot.sendMessage(chatId, success ? successMsg : `⚠️ tmux session "${config.tmuxSession}" not found`);

// Action handlers for inline buttons
const actions: Record<string, () => Promise<boolean>> = {
  approve,
  deny,
  skip,
  escape,
};

// Handle button callbacks
bot.on('callback_query', async (query) => {
  if (!query.message || !isOwner(query.message.chat.id)) return;

  const action = query.data;
  const handler = action && actions[action];

  if (handler) {
    const success = await handler();
    await bot.answerCallbackQuery(query.id, {
      text: success ? `${action} sent` : `tmux session not found`,
    });

    // Remove buttons after action (only on success)
    if (success) {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
        }
      );
    }
  }
});

// Handle all messages
bot.on('message', async (msg) => {
  if (!isOwner(msg.chat.id)) return; // Silent guard

  const text = msg.text;
  if (!text) return;

  const chatId = msg.chat.id;

  // Commands
  switch (text) {
    case '/start':
      await bot.sendMessage(chatId, '👋 <b>Claude Bot</b>\n\nRemote control for Claude Code via Telegram.', {
        parse_mode: 'HTML',
      });
      break;

    case '/ping':
      await bot.sendMessage(chatId, 'pong');
      break;

    case '/status': {
      const available = await isSessionAvailable();
      await bot.sendMessage(
        chatId,
        available
          ? `✅ tmux session "${config.tmuxSession}" is active`
          : `❌ tmux session "${config.tmuxSession}" not found`
      );
      break;
    }

    case '/y':
      await reply(chatId, await approve(), 'Approved');
      break;

    case '/n':
      await reply(chatId, await deny(), 'Denied');
      break;

    case '/clean': {
      const currentMsgId = msg.message_id;
      let deleted = 0;

      for (let i = currentMsgId; i > currentMsgId - 100; i--) {
        try {
          await bot.deleteMessage(chatId, i);
          deleted++;
        } catch {
          // Message doesn't exist or can't be deleted
        }
      }

      await bot.sendMessage(chatId, `🧹 Cleaned ${deleted} messages`);
      break;
    }

    default:
      // Text input - send to terminal (no reply, user knows what they sent)
      if (!text.startsWith('/')) {
        const success = await sendText(text);
        if (!success) await bot.sendMessage(chatId, `⚠️ tmux session "${config.tmuxSession}" not found`);
      }
  }
});

// Export for external use
export { bot };
