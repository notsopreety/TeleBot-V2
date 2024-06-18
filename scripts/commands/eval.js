module.exports = {
    config: {
        name: 'eval',
        aliases: ['evaluate'],
        category: 'development',
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
            return bot.sendMessage(chatId, 'You do not have permission to use this command.');
        }
        const code = args.join(' ');
        if (!code) {
            return bot.sendMessage(chatId, `Please provide some code to execute. Usage: /eval <code>`);
        }
        try {
            let result = await eval(code);
            if (typeof result !== 'string') {
                result = require('util').inspect(result);
            }
            bot.sendMessage(chatId, `Result: ${result}`);
        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, `Error: ${error.message}`);
        }
    }
};
