module.exports = {
    config: {
        name: 'start',
        aliases: ['example'], 
        category: 'general',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Start the bot',
        usage: 'start'
    },

    onStart: async function({ msg, bot, config }) {
        const welcomeMessage = `Welcome to ${config.botName}! How can I help you?`;
        bot.sendMessage(msg.chat.id, welcomeMessage, { replyToMessage: msg.message_id });
    }
};
