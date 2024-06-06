module.exports = {
    config: {
        name: 'pfp',
        aliases: ['profilepic'],
        category: 'general',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get profile picture of the sender or mentioned user',
        usage: '/pfp [reply to user message]'
    },

    onStart: async function({ msg, bot }) {
        let userId;

        // Check if a user is mentioned in the message
        if (msg.reply_to_message && msg.reply_to_message.from) {
            // Get the ID of the mentioned user
            userId = msg.reply_to_message.from.id;
        } else if (msg.entities && msg.entities.length > 0 && msg.entities[0].type === 'mention') {
            // Extract username from mention entity
            const mention = msg.text.substring(msg.entities[0].offset + 1, msg.entities[0].offset + msg.entities[0].length);
            // Get user info from username
            const user = await bot.getUser(mention);
            if (user && user.id) {
                userId = user.id;
            } else {
                bot.sendMessage(msg.chat.id, 'User not found.', { replyToMessage: msg.message_id });
                return;
            }
        } else {
            // Use sender's ID
            userId = msg.from.id;
        }

        // Get user profile photos
        const userProfilePhotos = await bot.getUserProfilePhotos(userId);

        // Check if user has profile photos
        if (userProfilePhotos && userProfilePhotos.photos && userProfilePhotos.photos.length > 0) {
            // Get the last photo from the first photo set
            const photoId = userProfilePhotos.photos[0][userProfilePhotos.photos[0].length - 1].file_id;
            // Send the photo
            bot.sendPhoto(msg.chat.id, photoId, { replyToMessage: msg.message_id });
        } else {
            // No profile photo found
            bot.sendMessage(msg.chat.id, 'No profile photo found.', { replyToMessage: msg.message_id });
        }
    }
};
