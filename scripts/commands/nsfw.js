const axios = require('axios');

module.exports = {
    config: {
        name: "nsfw",
        aliases: ["nsfw"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "image",
        description: "Fetch and send a random NSFW image or GIF from specified category.",
        usage: "nsfw <category> \nHere's Category:\nWaifu, Neko, Trap, Blowjob",
    },

    onStart: async function ({ bot, chatId, msg, args }) {
        // List of valid categories
        const validCategories = ["waifu", "neko", "trap", "blowjob"];

        // Determine the category from the command arguments, defaulting to 'waifu'
        const category = args[0] && validCategories.includes(args[0].toLowerCase()) ? args[0].toLowerCase() : "waifu";

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, `🔍 Fetching a NSFW ${category} image...`, { replyToMessage: msg.message_id });

        try {
            // Make a request to the NSFW API
            const apiUrl = `https://api.waifu.pics/nsfw/${category}`;
            const response = await axios.get(apiUrl);

            if (response.status === 200 && response.data.url) {
                const fileUrl = response.data.url;

                // Determine whether the file is an image or a GIF
                const isGif = fileUrl.endsWith('.gif');

                if (isGif) {
                    // Send the GIF file
                    await bot.sendDocument(chatId, fileUrl, { caption: `Here is a NSFW ${category} GIF for you.` });
                } else {
                    // Send the image file
                    await bot.sendPhoto(chatId, fileUrl, { caption: `Here is a NSFW ${category} image for you.` });
                }

                // Delete the pre-processing message after sending the file
                await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
            } else {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch the NSFW content. Please try again later.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("NSFW API Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch the NSFW content. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
