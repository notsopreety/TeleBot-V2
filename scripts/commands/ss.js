const axios = require('axios');

module.exports = {
    config: {
        name: 'ss',
        aliases: ['screenshot'],
        category: 'general',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Take a screenshot of a webpage or Google search results',
        usage: 'ss <url>'
    },

    onStart: async function({ bot, chatId, args, msg }) {
    const apiUrl = "http://api.screenshotlayer.com/api/capture";
    const accessKey = "JB9FIP8PjhQCwjdZbsnkZ22Bxh0CWJVm";

    const url = args[0];

    if (!url) {
        bot.sendMessage(chatId, "⚠️ Please provide a URL.\n💡 Usage: /screenshot <url>", { replyToMessage: msg.message_id });
        return;
    }

    try {
        const response = await axios.get(apiUrl, {
            params: {
                access_key: accessKey,
                url: url,
                viewport: "1440x900", // Adjust the viewport size as needed
                format: "PNG", // You can choose other formats like JPG, GIF, etc.
            },
            responseType: 'arraybuffer',
        });

        // Send the screenshot as a photo
        bot.sendPhoto(chatId, Buffer.from(response.data, 'binary'), { replyToMessage: msg.message_id });
    } catch (error) {
        console.error(error.message);
        bot.sendMessage(chatId, "⚠️ An error occurred while taking the screenshot.");
    }
    }
};
