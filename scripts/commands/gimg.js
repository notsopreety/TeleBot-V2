const axios = require('axios');

module.exports = {
    config: {
        name: "gimg",
        aliases: ["googleimages"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Your Name',
        category: "images",
        description: "Fetch and send images from Google Images API.",
        usage: "gimg <query>|<number>",
    },

    onStart: async function ({ bot, chatId, msg, args }) {
        // Check if a query is provided
        if (args.length === 0) {
            return bot.sendMessage(chatId, `⚠️ Please provide a search query.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        // Extract query and number from arguments
        const [query, numImages] = args.join(" ").split("|");

        // Parse numImages as an integer, defaulting to 6 if not provided or invalid
        const num = parseInt(numImages.trim()) || 6;

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, `🔍 Searching for ${num} images related to "${query}"...`, { replyToMessage: msg.message_id });

        try {
            // Make a request to the Google Images API
            const apiUrl = `https://samirxpikachu.onrender.com/google/imagesearch?q=${encodeURIComponent(query)}`;
            const response = await axios.get(apiUrl);

            if (response.status === 200 && response.data.result.length > 0) {
                // Extract up to num images from the API response
                const images = response.data.result.slice(0, num);

                if (images.length === 0) {
                    await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No images found.', { replyToMessage: msg.message_id });
                    return;
                }

                // Prepare an array of media objects for the album
                const media = images.map(image => ({ url: image }));

                // Send the images as an album
                await bot.sendAlbum(chatId, media);

                // Delete the pre-processing message after sending the images
                await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
            } else {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No images found.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("Google Images API Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch images. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
