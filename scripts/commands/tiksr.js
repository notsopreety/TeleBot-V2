const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    config: {
        name: 'tiksr',
        aliases: ['tiktoksearch'],
        category: 'media',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Œ',
        description: 'Search top video on tiktok.',
        usage: 'tiksr <query>'
    },

    onStart: async function({ bot, chatId, args }) {
        if (args.length === 0) {
            return bot.sendMessage(chatId, "Please provide a search query. Usage: /tiksr <query>");
        }

        const query = encodeURIComponent(args.join(' '));
        const url = `https://apis-samir.onrender.com/tiktok/search/${query}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data.videos || data.videos.length === 0) {
                return bot.sendMessage(chatId, "No videos found for your query.");
            }

            const randomVideoUrl = data.videos[Math.floor(Math.random() * data.videos.length)];

        
            await bot.sendVideo(chatId, randomVideoUrl, {
                caption: "Here's your TikTok video 📸"
            });
        } catch (error) {
            console.error('Error fetching TikTok videos:', error);
            bot.sendMessage(chatId, "An error occurred while searching for TikTok videos.");
        }
    }
};
