const axios = require('axios');

module.exports = {
    config: {
        name: 'pindl',
        aliases: ['pindownload', 'pin', 'pinterest'],
        category: 'downloader',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download video from Pinterest',
        usage: 'pindl <URL>'
    },

    onStart: async function({ msg, bot, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No URL provided. Usage: /pindl <URL>', { replyToMessage: msg.message_id });
            }

            const pinterestUrl = args[0];
            const apiUrl = `https://pinterestdownloader.io/frontendService/DownloaderService?url=${encodeURIComponent(pinterestUrl)}`;
            const downloadMsg = await bot.sendMessage(msg.chat.id, '⏳ Fetching media...', { replyToMessage: msg.message_id });

            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data && data.medias && data.medias.length > 0) {
                const videoMedia = data.medias.find(media => media.extension === 'mp4');
                const imageMedia = data.medias.reduce((prev, current) => (prev.size > current.size) ? prev : current);
                const message = data.title || 'Pinterest Media';

                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

                if (videoMedia) {
                    const videoUrl = videoMedia.url;
                    await bot.sendVideo(msg.chat.id, videoUrl, { caption: `<b>Title:</b> ${message}`, parseMode: 'HTML' }, { replyToMessage: msg.message_id });
                } else if (imageMedia) {
                    const imageUrl = imageMedia.url;
                    await bot.sendPhoto(msg.chat.id, imageUrl, { caption: `<b>Title:</b> ${message}`, parseMode: 'HTML' }, { replyToMessage: msg.message_id });
                }
            } else {
                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);
                bot.sendMessage(msg.chat.id, 'No media found! Something went wrong.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error fetching or sending media:', error);
            bot.sendMessage(msg.chat.id, 'Error fetching or sending media.', { replyToMessage: msg.message_id });
        }
    }
};
