module.exports = {
    config: {
        name: 'uid',
        aliases: [],
        category: 'utility',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get the user ID of the sender, a mentioned user, or the user whose message is being replied to.',
        usage: '/uid [username or mention]'
    },

    onStart: async function({ msg, bot }) {
        // Check if a user is mentioned in the message
        if (msg.entities && msg.entities[0].type === 'mention') {
            const mention = msg.entities[0];
            const mentionedUserId = msg.text.substring(mention.offset + 1, mention.offset + mention.length);
            return bot.sendMessage(msg.chat.id, `User ID: ${mentionedUserId}`);
        }

        // Check if a username is provided in the command
        const args = msg.text.split(' ');
        if (args.length > 1) {
            const username = args[1].replace('@', '');
            try {
                const chatMember = await bot.getChatMember(msg.chat.id, username);
                return bot.sendMessage(msg.chat.id, `User ID: ${chatMember.user.id}`);
            } catch (error) {
                return bot.sendMessage(msg.chat.id, 'User not found.');
            }
        }

        // Check if the command is a reply to a message
        if (msg.reply_to_message) {
            const repliedUserId = msg.reply_to_message.from.id;
            return bot.sendMessage(msg.chat.id, `User ID: ${repliedUserId}`);
        }

        // If none of the above conditions are met, send the sender's user ID
        return bot.sendMessage(msg.chat.id, `Your User ID: ${msg.from.id}`);
    }
};
