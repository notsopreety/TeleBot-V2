const axios = require('axios');
const FormData = require('form-data');
const imgbbApiKey = 'e6a573af64fc40a0b618acccd6677b74'; // Replace with your ImgBB API key


module.exports = {
    config: {
        name: "gemini",
        alias: ["bard"],
        category: "ai",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Get AI-generated responses using Gemini API",
        usage: "gemini <query>",
    },

    onStart: async function ({ bot, msg, args, config, userId }) {
        try {
            const { chat } = msg;

            if (!args.length && !msg.reply_to_message) {
                await bot.sendMessage(chat.id, "Please provide a query or reply to a message/image.",  { replyToMessage: msg.message_id });
                return;
            }

            let query;
            let response;

            if (msg.reply_to_message && msg.reply_to_message.photo) {
                // Extract the image URL from the reply
                const fileId = msg.reply_to_message.photo[0].file_id;
                const file = await bot.getFile(fileId);
                const fileUrl = `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`;

                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

                const formData = new FormData();
                formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });

                const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                    params: {
                        key: imgbbApiKey,
                    },
                });

                const imageUrl = imgbbResponse.data.data.url;

                query = args.join(" ");
                const apiUrl = `https://apibysamir.onrender.com/geminiv2?prompt=${encodeURIComponent(query)}&imgUrl=${encodeURIComponent(imageUrl)}&apikey=APIKEY`;

                response = await axios.get(apiUrl);
            } else if (msg.reply_to_message && msg.reply_to_message.text) {
                query = msg.reply_to_message.text;

                const apiUrl = `https://apibysamir.onrender.com/gemini?query=${encodeURIComponent(query)}&chatid=${userId}&apikey=APIKEY`;

                response = await axios.get(apiUrl);
            } else {
                query = args.join(" ");

                const apiUrl = `https://apibysamir.onrender.com/gemini?query=${encodeURIComponent(query)}&chatid=${userId}&apikey=APIKEY`;

                response = await axios.get(apiUrl);
            }

            if (response.data && response.data.response) {
                await bot.sendMessage(chat.id, response.data.response,  { replyToMessage: msg.message_id });
            } else {
                await bot.sendMessage(chat.id, "No response from Gemini API.",  { replyToMessage: msg.message_id });
            }

        } catch (error) {
            console.error('Error fetching Gemini response:', error);
            await bot.sendMessage(msg.chat.id, "Error fetching Gemini response.",  { replyToMessage: msg.message_id });
        }
    },
};
