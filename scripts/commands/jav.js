const axios = require('axios');

module.exports = {
    config: {
        name: 'jav',
        category: 'image',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Random Jav Image',
        usage: 'jav'
    },

    onStart: async function({ msg, bot }) {
        const api = 'https://wibu-api.eu.org/api/porn/jav?x_wibu_key=WIBUAPI-5TIsHe4cvTH6AB2HoQFUxYMrxdlm350rPafaLIxeQULTFh4MW9LIHIZcx0RzCI76uyKJnCmD7HjO_gU-XQ728P2x2PU1cmgvSxfUTw';

        try {
            // Fetch the image directly from the API
            const response = await axios.get(api, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            // Send the image buffer as a photo
            bot.sendPhoto(msg.chat.id, buffer, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('Error fetching image from API:', error);
            bot.sendMessage(msg.chat.id, 'Failed to fetch image. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
