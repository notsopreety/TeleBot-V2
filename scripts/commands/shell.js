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

    onStart: async function({ bot, args, chatId, userId }) {
        const owner = '5947023314'; // Replace with your Telegram user ID
        if (userId.toString() !== owner) {
            return bot.sendMessage(chatId, 'You do not have permission to use this command.');
        }
        const command = args.join(" ");

        if (!command) {
            bot.sendMessage(chatId, "Please provide a command to execute.");
            return;
        }

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "⏰| Executing command...");

        exec(command, (error, stdout, stderr) => {
            // Delete the pre-processing message
            bot.deleteMessage(chatId, preMessage.message_id);

            if (error) {
                console.error(`Error executing command: ${error}`);
                bot.sendMessage(chatId, `An error occurred while executing the command: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Command execution resulted in an error: ${stderr}`);
                bot.sendMessage(chatId, `Command execution resulted in an error: ${stderr}`);
                return;
            }

            console.log(`✅| Command executed successfully:\n${stdout}`);
            bot.sendMessage(chatId, `Command executed successfully:\n${stdout}`);
        });
    }
};
