module.exports = {
    config: {
        name: 'prefix',
        aliases: ['setprefix'], // Add more aliases if needed
        category: 'admin',
        role: 2, // Only bot admin can change prefix
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Change the bot\'s prefix',
        usage: '/prefix <new-prefix>'
    },

    onStart: async function({ msg, bot, args, config }) {
        // Check if new prefix is provided
        if (!args[0]) {
            bot.sendMessage(msg.chat.id, 'Please provide a new prefix.', { replyToMessage: msg.message_id });
            return;
        }

        // Update the prefix in the config.json file
        config.prefix = args[0];
        // You need to implement the function to save the updated config to config.json

        // Send confirmation message
        bot.sendMessage(msg.chat.id, `Bot's prefix has been updated to: ${args[0]}`, { replyToMessage: msg.message_id });
    }
};
