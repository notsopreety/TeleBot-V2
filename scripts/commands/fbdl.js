const axios = require('axios');

module.exports = {
    config: {
        name: 'fb',
        aliases: ['fbdl', 'facebook', 'fbvid'],
        category: 'downloader',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download Facebook video',
        usage: 'fb <URL>'
    },

    onStart: async function({ msg, bot, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No URL provided. Usage: /fb <URL>');
            }

            const downloadingMsg = await bot.sendMessage(msg.chat.id, '⏳ Downloading video...');

            const link = args[0]; // Assuming the URL is the first argument

            const url = 'https://getindevice.com/wp-json/aio-dl/video-data/';
            const payload = {
                url: link,
                token: 'e07a532f5d19affd23559c7339eecaad68fc958d05fc18c7f1512b8485570b28'
            };

            const response = await axios.post(url, payload);
            const media = response.data.medias.length > 1 ? response.data.medias.slice(-1)[0] : response.data.medias[0];

            if (media.extension === 'mp4') {
                const message = `<b>Title:</b> ${response.data.title}\n<b>Duration:</b> ${response.data.duration}\n<b>Source:</b> ${response.data.source}\n<b>Size:</b> ${media.formattedSize}`;

                await bot.deleteMessage(downloadingMsg.chat.id, downloadingMsg.message_id);
                await bot.sendVideo(msg.chat.id, media.url, { caption: message, parseMode: 'HTML' });
            } else {
                await bot.deleteMessage(downloadingMsg.chat.id, downloadingMsg.message_id);
                bot.sendMessage(msg.chat.id, 'No video available to download.');
            }
        } catch (error) {
            console.error('Error fetching or sending video:', error);
            bot.sendMessage(msg.chat.id, 'Error fetching or sending video.');
        }
    }
};
