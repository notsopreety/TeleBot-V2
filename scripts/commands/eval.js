module.exports = {
    config: {
        name: 'eval',
        aliases: ['evaluate'],
        category: 'admin',
        role: 2, 
        cooldowns: 0, 
        version: '1.0.0', 
        author: 'Samir Œ', 
        description: 'Evaluates/Executes JavaScript code',
        usage: 'eval <code>' 
    },
    
    onStart: async function({ msg, bot, args, chatId, userId, config, botName, senderName, username, copyrightMark, threadModel, userModel, user, thread }) {
        const owner = '5947023314'; // Replace with your Telegram user ID
        if (userId.toString() !== owner) {
            return bot.sendMessage(chatId, 'You do not have permission to use this command.', { replyToMessage: msg.message_id });
        }
        const code = args.join(' ');
        if (!code) {
            return bot.sendMessage(chatId, `Please provide some code to execute. Usage: /eval <code>`, { replyToMessage: msg.message_id });
        }
        try {
            let result = await eval(code);
            if (typeof result !== 'string') {
                result = require('util').inspect(result);
            }
            bot.sendMessage(chatId, `Result: ${result}`, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, `Error: ${error.message}`, { replyToMessage: msg.message_id });
        }
    }
};
