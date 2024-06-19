const axios = require('axios');
const fs = require('fs');

module.exports = {
    config: {
        name: 'setphoto',
        aliases: ['gcimg'],
        category: 'admin',
        role: 2, // Bot admin only
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Set the chat photo by replying to a photo message.',
        usage: 'setphoto [reply to photo msg]'
    },

    onStart: async function({ msg, bot, config }) {
        // Check if the message is a reply and contains a photo
        if (!msg.reply_to_message || !msg.reply_to_message.photo) {
            return bot.sendMessage(msg.chat.id, 'Please reply to a photo message to set it as the chat photo.', { replyToMessage: msg.message_id });
        }

        try {
            // Get the largest photo size
            const photoSize = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];

            // Get the photo file ID
            const photoId = photoSize.file_id;

            // Get information about the photo file
            const photoInfo = await bot.getFile(photoId);

            // Download the photo file
            const response = await axios.get(`https://api.telegram.org/file/bot${config.botToken}/${photoInfo.file_path}`, { responseType: 'arraybuffer' });

            // Save the photo file to disk
            fs.writeFileSync('photo.jpg', response.data);

            // Set the chat photo
            await bot.setChatPhoto(msg.chat.id, 'photo.jpg');

            // Delete the temporary photo file
            fs.unlinkSync('photo.jpg');

            return bot.sendMessage(msg.chat.id, 'Chat photo updated successfully.', { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('Error setting chat photo:', error);
            return bot.sendMessage(msg.chat.id, 'An error occurred while setting the chat photo.');
        }
    }
};
