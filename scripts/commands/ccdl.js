const axios = require('axios');

module.exports = {
    config: {
        name: 'capcutdl',
        aliases: ['ccdl'],
        category: 'downloader',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download CapCut video',
        usage: 'capcutdl <URL>'
    },

    onStart: async function({ msg, bot, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No URL provided. Usage: /capcutdl <URL>');
            }

            const downloadMsg = await bot.sendMessage(msg.chat.id, '⏳ Fetching video...');

            const url = `https://apidown.site/api/capcut/v1?link=${encodeURIComponent(args[0])}`;
            const response = await axios.get(url);
            const data = response.data;

            await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

            if (data.status && data.url) {
                const message = `<b>Title:</b> ${data.title}\n<b>Description:</b> ${data.description}\n<b>Total Use:</b> ${data.usage}`;

                await bot.sendVideo(msg.chat.id, data.url, { caption: message, parseMode: 'HTML' });
            } else {
                bot.sendMessage(msg.chat.id, 'No video found! Something went wrong.');
            }
        } catch (error) {
            console.error('Error fetching or sending CapCut video:', error);
            bot.sendMessage(msg.chat.id, 'Error fetching or sending CapCut video.');
        }
    }
};
