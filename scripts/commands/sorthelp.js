// scripts/commands/sorthelp.js
module.exports = {
    config: {
        name: 'sorthelp',
        aliases: ['sh'],
        category: 'utility',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Toggle sorting method for the help command',
        usage: 'sorthelp [category|name]'
    },

    onStart: async function({ msg, bot, args, threadModel, config }) {
        const chatId = msg.chat.id.toString();
        let thread = await threadModel.findOne({ chatId });

        if (!thread) {
            thread = new threadModel({ chatId });
            await thread.save();
            console.log(`[DATABASE] New thread: ${chatId} database has been created!`);
        }

        if (!args[0] || (args[0] !== 'category' && args[0] !== 'name')) {
            return bot.sendMessage(chatId, 'Usage: /sorthelp [category|name]', { replyToMessage: msg.message_id });
        }

        thread.sorthelp = args[0] === 'category';
        await thread.save();
        
        bot.sendMessage(chatId, `Help sorting method updated to ${thread.sorthelp ? 'category' : 'name'}.`, { replyToMessage: msg.message_id });
    }
};
