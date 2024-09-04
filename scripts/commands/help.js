const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'help',
        aliases: ['h'],
        category: 'utility',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get a list of all available commands or detailed information about a specific command',
        usage: 'help [command|page]'
    },

    onStart: async function({ msg, bot, args, config, threadModel }) {
        const chatId = msg.chat.id.toString();

        // Find thread from database
        let thread = await threadModel.findOne({ chatId });
        if (!thread) {
            return bot.sendMessage(chatId, 'Thread not found in the database.', { replyToMessage: msg.message_id });
        }

        const sorthelp = thread.sorthelp || false; // Default to false if not set
        const commandsDir = path.resolve(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'test.js');

        // Dynamically require all command files
        const commands = commandFiles.map(file => require(path.join(commandsDir, file)));

        if (!commands || !commands.length) {
            console.error('Commands array is empty or undefined.');
            return bot.sendMessage(chatId, 'There are no available commands at the moment.', { replyToMessage: msg.message_id });
        }

        // Handle command details
        if (args[0]) {
            if (!isNaN(args[0])) {
                // Handle pagination if sorthelp is `name`
                if (sorthelp === false) {
                    const page = parseInt(args[0], 10);
                    if (page < 1 || page > Math.ceil(commands.length / 15)) {
                        return bot.sendMessage(chatId, 'Page not found. Please use a valid page number.', { replyToMessage: msg.message_id });
                    }

                    const start = (page - 1) * 15;
                    const end = Math.min(start + 15, commands.length);
                    const commandList = commands.slice(start, end);

                    let helpMessage = `Help - Page ${page}/${Math.ceil(commands.length / 15)}\n`;
                    commandList.forEach((cmd, index) => {
                        helpMessage += `━━━━━━━━━━━━━\n[${start + index + 1}]. ${cmd.config.name} - ${cmd.config.description}\n`;
                    });
                    helpMessage += `━━━━━━━━━━━━━\nPage [ ${page}/${Math.ceil(commands.length / 15)} ]\n`;
                    helpMessage += `Currently, the bot has ${commands.length} commands that can be used\n`;
                    helpMessage += `» Type /help <page> to view the command list\n`;
                    helpMessage += `» Type /help <command> to view the details of that command\n`;
                    helpMessage += `━━━━━━━━━━━━━\n${config.copyrightMark}`;

                    return bot.sendMessage(chatId, helpMessage, { replyToMessage: msg.message_id });
                }
            } else {
                // Handle command detail
                const commandName = args[0].toLowerCase();
                const command = commands.find(cmd => cmd.config.name.toLowerCase() === commandName || (cmd.config.aliases && cmd.config.aliases.includes(commandName)));

                if (command) {
                    const { name, description, aliases = [], category, version, role, cooldowns, author, usage } = command.config;
                    const roleText = role === 0 ? 'All users' : role === 1 ? 'Group admin' : 'Bot admin';
                    return bot.sendMessage(chatId, `
━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
━━━━━━━━━━━━━━━━━━━━━━
» Description: ${description || 'No description available.'}
» Other names: ${aliases.join(', ') || 'None'}
» Category: ${category}
» Version: ${version || '1.0.0'}
» Permission: ${roleText}
» Time per command: ${cooldowns} seconds
» Author: ${author || 'Samir Thakuri'}
━━━━━━━━━━  ❖  ━━━━━━━━━━
» Usage guide:
${config.prefix}${usage}
━━━━━━━━━━  ❖  ━━━━━━━━━━
» Notes:
• The content inside <XXXXX> can be changed
• The content inside [a|b|c] is a or b or c
                    `, { replyToMessage: msg.message_id });
                } else {
                    return bot.sendMessage(chatId, `Command not found. Use ${config.prefix}help to see available commands.`, { replyToMessage: msg.message_id });
                }
            }
        } else {
            // Handle help menu
            if (sorthelp === true) {
                // Categorized list
                let helpMessage = `Hello, ${msg.from.first_name}!\nHere's My Command List\n\n`;

                // Group commands by category
                const commandsByCategory = {};
                commands.forEach(cmd => {
                    const { name, category } = cmd.config;
                    if (!commandsByCategory[category]) {
                        commandsByCategory[category] = [];
                    }
                    commandsByCategory[category].push(name);
                });

                // Format command list for each category
                Object.entries(commandsByCategory).forEach(([category, cmds]) => {
                    helpMessage += `╭──────❨ ${category} ❩\n`;
                    cmds.forEach(cmd => {
                        helpMessage += `├ ${cmd}\n`;
                    });
                    helpMessage += `╰──────────────●\n`;
                });

                helpMessage += `Total Commands: ${commands.length}\n`;
                helpMessage += `${config.copyrightMark}`;

                return bot.sendMessage(chatId, helpMessage, { replyToMessage: msg.message_id });
            } else {
                // Default help menu with pagination
                const commandList = commands.slice(0, 15); // Show first 15 commands
                let helpMessage = `Hello, ${msg.from.first_name}!\nHere's My Command List\n\n━━━━━━━━━━━━━━━━━━━━━━`;
                commandList.forEach((cmd, index) => {
                    helpMessage += `\n[${index + 1}]. ${cmd.config.name} - ${cmd.config.description|| ''}\n`;
                });
                helpMessage += `\n━━━━━━━━━━━━━━━━━━━━━━\nPage [ 1/${Math.ceil(commands.length / 15)} ]\n`;
                helpMessage += `Currently, the bot has ${commands.length} commands that can be used\n`;
                helpMessage += `» Type /help <page> to view the command list\n`;
                helpMessage += `» Type /help <command> to view the details of that command\n`;
                helpMessage += `━━━━━━━━━━━━━━━━━━━━━━\n${config.copyrightMark}`;

                return bot.sendMessage(chatId, helpMessage, { replyToMessage: msg.message_id });
            }
        }
    }
};
