const axios = require('axios');
module.exports = {
    config: {
        name: 'imagine',
        aliases: ['generate'], 
        category: 'ai',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Generate AI image using prompt',
        usage: 'imagine <prompt>'
    },

    onStart: async function({ bot, args, chatId }) {
        const prompt = args.join(' ');
        if (!prompt) {
            bot.sendMessage(chatId, "Please provide a prompt.");
            return;
        }

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "Generating AI image...");

        try {
            // Fetch AI image from the API
            const apiUrl = `https://samirxpikachu.onrender.com/imagine?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            // Convert the response to a Buffer
            const imagineResponse = Buffer.from(response.data);

            // Send the AI image as a photo along with a text message
            bot.sendPhoto(chatId, imagineResponse, { caption: "Here's Your AI IMG" });
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "An error occurred while generating the AI image.");
        } finally {
            // Delete the pre-processing message
            bot.deleteMessage(chatId, preMessage.message_id);
        }
    }
};
