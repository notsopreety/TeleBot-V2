module.exports = {
    config: {
        name: 'autogreet',
        aliases: ['greeting'],
        category: 'admin',
        role: 2, // Bot admin only
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Enable or disable auto greetings',
        usage: 'autogreet [on/off]'
    },

    onStart: async function({ msg, bot, args, config }) {
        // Check if argument is provided
        if (!args[0]) {
            bot.sendMessage(msg.chat.id, 'Please provide either "on" or "off".', { replyToMessage: msg.message_id });
            return;
        }

        // Convert argument to lowercase
        const mode = args[0].toLowerCase();

        // Check if mode is valid
        if (mode !== 'on' && mode !== 'off') {
            bot.sendMessage(msg.chat.id, 'Invalid mode. Please use "on" or "off".', { replyToMessage: msg.message_id });
            return;
        }

        // Update the config based on the provided mode
        if (mode === 'on') {
            config.greetNewMembers.enabled = true;
            config.farewellMembers.enabled = true;
        } else {
            config.greetNewMembers.enabled = false;
            config.farewellMembers.enabled = false;
        }
        // You need to implement the function to save the updated config to config.json

        // Send confirmation message
        bot.sendMessage(msg.chat.id, `Auto greetings have been set to: ${mode}`, { replyToMessage: msg.message_id });
    }
};
