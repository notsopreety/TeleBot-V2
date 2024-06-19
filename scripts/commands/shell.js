const { exec } = require('child_process');
module.exports = {
    config: {
        name: 'shell',
        aliases: ['shellcmd'],
        category: 'admin',
        role: 2, 
        cooldowns: 0, 
        version: '1.0.0', 
        author: 'Samir Thakuri', 
        description: 'Execute shell commands',
        usage: 'shell <cmd>' 
    },

    onStart: async function({ bot, args, chatId, userId, msg }) {
        const owner = '5947023314'; // Replace with your Telegram user ID
        if (userId.toString() !== owner) {
            return bot.sendMessage(chatId, 'You do not have permission to use this command.', { replyToMessage: msg.message_id });
        }
        const command = args.join(" ");

        if (!command) {
            bot.sendMessage(chatId, "Please provide a command to execute.", { replyToMessage: msg.message_id });
            return;
        }

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "⏰| Executing command...", { replyToMessage: msg.message_id });

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error(`Error executing command: ${error}`);
                bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, `An error occurred while executing the command: ${error.message}`, { replyToMessage: msg.message_id });
                return;
            }

            if (stderr) {
                console.error(`Command execution resulted in an error: ${stderr}`);
                bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, `Command execution resulted in an error: ${stderr}`, { replyToMessage: msg.message_id });
                return;
            }

            console.log(`✅| Command executed successfully:\n${stdout}`);
            bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, `Command executed successfully:\n${stdout}`, { replyToMessage: msg.message_id });
        });
    }
};
