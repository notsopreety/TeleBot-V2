const axios = require('axios');

module.exports = {
    config: {
        name: "meta",
        alias: ["llama"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Get AI-generated responses using Meta AI API",
        usage: "meta <query>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            const { chat, from } = msg;
            const query = args.join(" ");
            const userId = from.id;

            if (!query) {
                await bot.sendMessage(chat.id, "Please provide a query.", { replyToMessage: msg.message_id });
                return;
            }

            const apiUrl = `https://metallamaapi.onrender.com/ai?msg=${encodeURIComponent(query)}&id=${encodeURIComponent(userId)}`;

            const response = await axios.get(apiUrl);

            if (response.data && response.data.response) {
                await bot.sendMessage(chat.id, response.data.response, { replyToMessage: msg.message_id });
            } else {
                await bot.sendMessage(chat.id, "No response from Meta AI API.", { replyToMessage: msg.message_id });
            }

        } catch (error) {
            console.error('Error fetching Meta AI response:', error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Error occurred while fetching Meta AI response.', { replyToMessage: msg.message_id });
        }
    },
};
