const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./../../database/models/user'); // Adjust the path to your User model
const Thread = require('./../../database/models/thread'); // Adjust the path to your Thread model

module.exports = {
    config: {
        name: 'dropdb',
        aliases: ['cleardb'],
        category: 'admin',
        role: 2,
        cooldowns: 10,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Clear the entire database',
        usage: 'dropdb'
    },

    onStart: async function({ msg, bot, args, userId, config }) {
        // Ensure that `config.owner` is a string for proper comparison
        const ownerId = config.owner.toString();

        if (userId !== ownerId) {
            await bot.sendMessage(msg.chat.id, 'You do not have permission to use this command.', { replyToMessage: msg.message_id });
            return;
        }

        const confirmationMessage = await bot.sendMessage(
            msg.chat.id,
            'Are you sure you want to clear the entire database? This action cannot be undone.',
            {
                replyMarkup: {
                    inline_keyboard: [
                        [
                            { text: 'Yes', callback_data: 'confirm_clear' },
                            { text: 'No', callback_data: 'cancel_clear' }
                        ]
                    ]
                }
            }
        );

        // Handler for callback queries
        bot.on('callbackQuery', async (callbackQuery) => {
            // Ensure `userId` is being compared correctly
            if (callbackQuery.message.chat.id !== msg.chat.id) return;
            if (callbackQuery.from.id.toString() !== userId.toString()) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'You are not authorized to perform this action.', show_alert: true });
                return;
            }

            if (callbackQuery.data === 'confirm_clear') {
                try {
                    await User.deleteMany({});
                    await Thread.deleteMany({});
                    await bot.sendMessage(msg.chat.id, 'Database has been cleared successfully.', { replyToMessage: confirmationMessage.message_id });
                } catch (error) {
                    console.error('Error clearing the database:', error.message);
                    await bot.sendMessage(msg.chat.id, 'Failed to clear the database. Please try again later.', { replyToMessage: confirmationMessage.message_id });
                }
            } else if (callbackQuery.data === 'cancel_clear') {
                await bot.sendMessage(msg.chat.id, 'Database clearing operation has been cancelled.', { replyToMessage: confirmationMessage.message_id });
            } else {
                await bot.sendMessage(msg.chat.id, 'Invalid response.', { replyToMessage: confirmationMessage.message_id });
            }

            // Optionally, you can delete the callback query message after handling it
            await bot.deleteMessage(msg.chat.id, callbackQuery.message.message_id);
        });
    }
};
