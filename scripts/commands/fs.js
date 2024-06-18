const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "filesend",
        aliases: ["fs"],
        category: "utility",
        role: 2, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Send the code of a command file along with a text file.",
        usage: "filesend <commandname>",
    },

    onStart: async function ({ bot, msg, args, chatId }) {
        if (args.length === 0) {
            return bot.sendMessage(msg.chat.id, "Please provide a command name or alias.");
        }

        // Extract the command name from the arguments
        const input = args[0];

        // Get the path to the commands directory
        const commandsPath = path.join(__dirname, '.');

        // Try to find the command file based on name or aliases
        const commandFile = findCommandFile(commandsPath, input);

        if (commandFile) {
            // Read the source code of the specified command file
            try {
                const textdata = fs.readFileSync(commandFile, 'utf-8');

                // Send the source code as a text message
                const sourceCode = "```javascript\n" + textdata + "\n```";
                const formattedResponse = sourceCode.match(/```(\w+)\n([\s\S]+)```/) ?
                    sourceCode : "```\n" + sourceCode + "\n```";

                bot.sendMessage(chatId, formattedResponse, { parseMode: 'Markdown' });
                // Send the command file as a document
                await bot.sendDocument(msg.chat.id, commandFile, { caption: `Here's the file for the command "${input}"` });
            } catch (error) {
                console.error(error);
                bot.sendMessage(msg.chat.id, `Error retrieving the source code for "${input}".`);
            }
        } else {
            // Send a message indicating that the command does not exist
            bot.sendMessage(msg.chat.id, `Command "${input}" does not exist.`);
        }
    }
};

// Function to find the command file based on name or aliases
function findCommandFile(commandsPath, input) {
    const files = fs.readdirSync(commandsPath);

    // Look for the command file based on name or aliases
    for (const file of files) {
        // Ensure we only check JavaScript files
        if (path.extname(file) === '.js') {
            const command = require(path.join(commandsPath, file));

            if (
                file.replace(/\.[^/.]+$/, '') === input ||  // Check file name
                command.config.name === input ||            // Check command name
                (command.config.aliases && command.config.aliases.includes(input)) // Check aliases
            ) {
                return path.join(commandsPath, file);
            }
        }
    }

    return null;
}
