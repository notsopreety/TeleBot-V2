const axios = require('axios');
const fs = require('fs');

module.exports = {
    config: {
        name: "igdl",
        aliases: ["instavid", "downig"],
        category: "downloader",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Download Instagram video",
        usage: "igdl <video_url>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, "No URL provided", { replyToMessage: msg.message_id });
            }

            const downloadMsg = await bot.sendMessage(msg.chat.id, '⏳ Fetching media...', { replyToMessage: msg.message_id });

            const link = args[0];
            const response = await axios.get(`https://apidown.site/api/instagram/v3?link=${encodeURIComponent(link)}`);

            if (response.data && response.data.length > 0) {
                for (const media of response.data) {
                    if (media.type === 'image') {
                        await bot.sendPhoto(msg.chat.id, media.url, { replyToMessage: msg.message_id });
                    } else if (media.type === 'video') {
                        await bot.sendVideo(msg.chat.id, media.url, { replyToMessage: msg.message_id });
                        break; // Send only the first video
                    }
                }

                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);
            } else {
                await bot.sendMessage(msg.chat.id, 'No media found! Something went wrong.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error fetching or sending media:', error);
            await bot.sendMessage(msg.chat.id, 'Error fetching or sending media', { replyToMessage: msg.message_id });
        }
    },
};
