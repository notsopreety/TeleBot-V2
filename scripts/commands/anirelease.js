const axios = require('axios');

module.exports = {
    config: {
        name: "anirelease",
        aliases: ["animerelease"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "anime",
        description: "Get details of upcoming anime episodes or new anime releases with release date and summary.",
        usage: "anirelease",
    },

    onStart: async function ({ bot, msg }) {
        const chatId = msg.chat.id;
        const url = 'https://api.jikan.moe/v4/schedules';

        try {
            const response = await axios.get(url);
            const data = response.data.data;

            if (!data.length) {
                return bot.sendMessage(chatId, "No upcoming anime releases found.", { replyToMessage: msg.message_id });
            }

            let message = "Upcoming Anime Releases:\n\n";

            data.slice(0, 5).forEach(anime => {
                message += `📺 *Title*: ${anime.title}\n`;
                message += `📅 *Release Date*: ${new Date(anime.airing_start).toLocaleDateString()}\n`;
                message += `📝 *Summary*: ${anime.synopsis || "No synopsis available"}\n`;
                message += `🔗 [More Info](${anime.url})\n\n`;
            });

            bot.sendMessage(chatId, message, { replyToMessage: msg.message_id, parseMode: 'Markdown' });
        } catch (error) {
            console.error("Error fetching anime release data:", error);
            bot.sendMessage(chatId, "Failed to fetch upcoming anime releases. Please try again later.", { replyToMessage: msg.message_id });
        }
    }
}
