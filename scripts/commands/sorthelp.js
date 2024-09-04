const mongoose = require('mongoose');
const Thread = require('./../../database/models/thread'); // Adjust the path to your Thread model

module.exports = {
    config: {
        name: 'sorthelp',
        aliases: [],
        category: 'admin',
        role: 2, // Assuming role 2 is admin
        cooldowns: 0,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Change sorting method for help command',
        usage: 'sorthelp'
    },

    onStart: async function({ msg, bot, args, userId, config }) {
        // Check if the user is authorized to use this command
        if (userId !== config.owner) {
            await bot.sendMessage(msg.chat.id, 'You are not authorized to perform this action.', { replyToMessage: msg.message_id });
            return;
        }

        // Get the current sorting method from the database
        let thread = await Thread.findOne({ chatId: msg.chat.id });
        if (!thread) {
            thread = new Thread({ chatId: msg.chat.id, sorthelp: false });
            await thread.save();
        }

        const currentsorting = thread.sorthelp ? 'Category' : 'Name';

        // Create the inline keyboard with buttons for sorting method
        const inlineKeyboard = bot.inlineKeyboard([
            [{ text: 'Category', callback_data: 'set_category' }],
            [{ text: 'Name', callback_data: 'set_name' }]
        ]);

        // Send the message with the current sorting method and buttons
        const message = await bot.sendMessage(
            msg.chat.id,
            `Choose sorting method:\nCurrent method: ${currentsorting}`,
            { replyMarkup: inlineKeyboard, replyToMessage: msg.message_id }
        );

        // Handle callback queries
        bot.on('callbackQuery', async (callbackQuery) => {
            if (callbackQuery.message.chat.id !== msg.chat.id) return;

            // Ensure this callback query is from the current command
            if (callbackQuery.message.message_id !== message.message_id) return;

            const selectedSorting = callbackQuery.data === 'set_category' ? true : false;

            // Update the sorthelp field in the database
            await Thread.updateOne({ chatId: msg.chat.id }, { sorthelp: selectedSorting });

            // Send a confirmation message
            await bot.sendMessage(
                msg.chat.id,
                `Sorting method has been updated to ${selectedSorting ? 'Category' : 'Name'}.`,
                { replyToMessage: callbackQuery.message.message_id }
            );

            // Optionally, you can delete the callback query message after handling it
            await bot.deleteMessage(msg.chat.id, callbackQuery.message.message_id);
        });
    }
};
