const axios = require('axios');
const FormData = require('form-data');
const { createWriteStream, unlinkSync, existsSync, mkdirSync } = require('fs-extra');
const imgbbApiKey = 'e6a573af64fc40a0b618acccd6677b74'; // Replace with your ImgBB API key

module.exports = {
    config: {
        name: 'imgbb',
        aliases: ['uploadimg'],
        category: 'utility',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakur',
        description: 'Upload an image to ImgBB by replying to an image message.',
        usage: 'imgbb - Upload the replied image to ImgBB.',
    },

    onStart: async function ({ bot, msg, config }) {
        const chatId = msg.chat.id;  // Ensure chatId is defined at the beginning

        try {
            const { reply_to_message } = msg;

            if (!reply_to_message || !reply_to_message.photo) {
                await bot.sendMessage(chatId, "Please reply to an image message to upload it to ImgBB.", { replyToMessage: msg.message_id });
                return;
            }

            const fileId = reply_to_message.photo[reply_to_message.photo.length - 1].file_id;
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
            await bot.sendMessage(chatId, `Image uploaded to ImgBB successfully:\n${imageUrl}`, { replyToMessage: msg.message_id });

        } catch (error) {
            console.error('Error in ImgBB upload command:', error);
            await bot.sendMessage(chatId, "Error occurred during image upload to ImgBB.", { replyToMessage: msg.message_id });
        }
    },
};