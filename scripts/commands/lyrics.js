const axios = require('axios');

module.exports = {
    config: {
        name: 'lyrics',
        aliases: ['ly'],
        category: 'general',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get lyrics of a song.',
        usage: 'lyrics <song name>'
    },

    onStart: async function({ msg, bot, args, chatId }) {
        const songName = args.join(" ");
        if (!songName) {
            bot.sendMessage(chatId, 'Please specify the name of the song you want to find lyrics for.', { replyToMessage: msg.message_id });
            return;
        }

        try {
            const res = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`);
            const data = res.data;

            if (data.lyrics) {
                const title = data.title;
                const artist = data.artist;
                const lyrics = data.lyrics;

                const reply = `❏ Title: ${title} \n❏ Artist: ${artist}\n\n❏ Lyrics: \n${lyrics}`;

                // Send message with image buffer
                bot.sendMessage(chatId, reply, { replyToMessage: msg.message_id });
            } else {
                bot.sendMessage(chatId, "Lyrics not found for that song.", { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "An error occurred while fetching lyrics.", { replyToMessage: msg.message_id });
        }
    }
};
