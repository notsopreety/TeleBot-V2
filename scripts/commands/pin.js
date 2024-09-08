const axios = require('axios');

module.exports = {
    config: {
        name: "pinterest",
        aliases: ["pin", "pinterestsearch"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.1',
        author: 'Samir Thakuri',
        category: "image",
        description: "Fetch images from Pinterest based on query.",
        usage: "pinterest <query> | [number]",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        if (args.length === 0) {
            return bot.sendMessage(chatId, `⚠️ Please provide a search query.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        // Join the arguments and split by "|"
        const input = args.join(" ").split("|");
        const query = input[0].trim();
        const number = parseInt(input[1]) || 6; // Default to 6 if number is not provided

        const apiUrl = `https://www.samirxpikachu.run.place/pinterest?query=${encodeURIComponent(query)}&number=${number}`;

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🔍 | Searching for images...", { replyToMessage: msg.message_id });

        try {
            // Make a request to the Pinterest API
            const response = await axios.get(apiUrl);

            if (response.data.status === 200 && response.data.result.length > 0) {
                // Prepare an array of image objects for the album
                const images = response.data.result.map(imageUrl => ({ type: 'photo', media: imageUrl }));

                // Send the album
                await bot.sendMediaGroup(chatId, images, { caption: `Here are images for "${query}"`, replyToMessage: msg.message_id });

                // Delete the pre-processing message after sending images
                await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
            } else {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No images found for the given query.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("Pinterest API Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch images. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
