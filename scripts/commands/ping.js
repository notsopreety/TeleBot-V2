// ping.js

module.exports = {
    config: {
        name: 'ping',
        category: 'general',
        role: 2,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Ping the bot to check if it is responsive.',
        usage: 'ping'
    },
    onStart: async function({ bot, msg }) {
        const startTime = Date.now();
        const sentMsg = await bot.sendMessage(msg.chat.id, 'Pinging...');
        const endTime = Date.now();
        const pingTime = endTime - startTime;
        bot.editMessageText({ chatId: sentMsg.chat.id, messageId: sentMsg.message_id }, `Pong! 🏓\nPing time: ${pingTime} ms`);
    }
};
