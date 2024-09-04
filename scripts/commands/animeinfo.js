const { translate } = require('@vitalets/google-translate-api');
const { Anime } = require('@shineiichijo/marika');

const client = new Anime();

module.exports = {
    config: {
        name: "animeinfo",
        aliases: ["anime"],
        category: "anime",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Get detailed information about an anime.",
        usage: "animeinfo <anime_name>",
    },

    onStart: async function ({ bot, msg, args, config }) {
        const chatId = msg.chat.id;
        const animeName = args.join(" ");

        if (!animeName) {
            await bot.sendMessage(chatId, "⚠️ Please enter the name of an anime to search for.");
            return;
        }

        try {
            // Search for the anime
            const anime = await client.searchAnime(animeName);
            const result = anime.data[0];

            // Translate background and synopsis
            const backgroundTranslation = await translate(result.background, { to: 'en', autoCorrect: true });
            const synopsisTranslation = await translate(result.synopsis, { to: 'hi', autoCorrect: true });

            // Format the anime info message
            const animeInfo = `
🎀 • **Title:** ${result.title}
🎋 • **Format:** ${result.type}
📈 • **Status:** ${result.status.toUpperCase().replace(/\_/g, ' ')}
🍥 • **Total Episodes:** ${result.episodes}
🎈 • **Duration:** ${result.duration}
✨ • **Based on:** ${result.source.toUpperCase()}
💫 • **Released:** ${result.aired.from}
🎗 • **Finished:** ${result.aired.to}
🎐 • **Popularity:** ${result.popularity}
🎏 • **Favorites:** ${result.favorites}
🎇 • **Rating:** ${result.rating}
🏅 • **Rank:** ${result.rank}
♦ • **Trailer:** ${result.trailer.url}
🌐 • **URL:** ${result.url}
🎆 • **Background:** ${backgroundTranslation.text}
❄ • **Synopsis:** ${synopsisTranslation.text}`;

            // Send the anime info along with the image
            await bot.sendPhoto(chatId, result.images.jpg.image_url, { caption: animeInfo });
        } catch (error) {
            console.error('Error fetching anime info:', error);
            await bot.sendMessage(chatId, "⚠️ Error retrieving anime information. Please try again.");
        }
    },
};
