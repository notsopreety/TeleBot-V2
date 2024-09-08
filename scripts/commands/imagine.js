const axios = require('axios');

module.exports = {
    config: {
        name: "mage",
        aliases: ["mageai"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "utility",
        description: "Generate an image using the mage API.",
        usage: "mage <prompt>",
    },

    onStart: async function ({ bot, msg, args, chatId }) {
        const prompt = args.join(' ');
        if (!prompt) {
            bot.sendMessage(chatId, "Please provide a prompt.", { replyToMessage: msg.message_id });
            return;
        }

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🎨 Generating image...", { replyToMessage: msg.message_id });

        try {
            // Fetch AI image from the API
            const apiUrl = `https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            // Convert the response to a Buffer
            const imagineResponse = Buffer.from(response.data);

            // Send the AI image as a photo along with a text message
            bot.sendPhoto(chatId, imagineResponse, { caption: `🖼️ Image generated for: ${prompt}` }, { replyToMessage: msg.message_id });
             await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
        } catch (error) {
            console.error("Error generating image:", error);
            bot.sendMessage(chatId, "❌ Failed to generate the image. Please try again later.", { replyToMessage: msg.message_id });
        }
    }
};
