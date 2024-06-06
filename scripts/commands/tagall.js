module.exports = {
    config: {
        name: 'tagall',
        aliases: [],
        category: 'utility',
        role: 1,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Mention all members in the group with an optional message.',
        usage: '/tagall [message]'
    },

    onStart: async function({ msg, bot }) {
        const chatId = msg.chat.id;

        // Get the count of members in the group
        const memberCount = await bot.getChatMembersCount(chatId);

        // Initialize an empty array to store member usernames
        const usernames = [];

        // Iterate over each member to fetch their information
        for (let i = 0; i < memberCount; i++) {
            const memberInfo = await bot.getChatMember(chatId, i);
            if (memberInfo && memberInfo.user && memberInfo.user.username) {
                usernames.push(`@${memberInfo.user.username}`);
            }
        }

        const args = msg.text.split(' ');

        if (args.length === 1) {
            // Mention all members without a custom message
            return bot.sendMessage(chatId, usernames.join(' '));
        } else {
            // Mention all members with a custom message
            const message = args.slice(1).join(' ');
            return bot.sendMessage(chatId, `${message}\n\n${usernames.join(' ')}`);
        }
    }
};
