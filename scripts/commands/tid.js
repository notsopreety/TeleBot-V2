module.exports = {
    config: {
        name: 'tid',
        aliases: ['threadid', 'gcuid', 'groupid'],
        category: 'group',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Sends the thread ID of the group',
        usage: '/tid'
    },

    onStart: async function({ bot, msg, chatId}) {
        if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
            bot.sendMessage(chatId, `The thread ID of this group is: ${chatId}`, { replyToMessage: msg.message_id });
        } else {
            bot.sendMessage(chatId, 'This command can only be used in a group or supergroup.', { replyToMessage: msg.message_id });
        }
    }
};