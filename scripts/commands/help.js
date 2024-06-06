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
        usage: '/help [command]'
    },

    onStart: async function({ msg, bot, args, config }) {
        // Read all command files in the same directory
        const commandsDir = path.resolve(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'help.js');

        // Dynamically require all command files
        const commands = commandFiles.map(file => require(path.join(commandsDir, file)));

        if (!commands || !commands.length) {
            console.error('Commands array is empty or undefined.');
            bot.sendMessage(msg.chat.id, 'There are no available commands at the moment.', { replyToMessage: msg.message_id });
            return;
        }

        // Check if a specific command is requested
        if (args[0]) {
            const commandName = args[0].toLowerCase();
            const command = commands.find(cmd => cmd.config.name.toLowerCase() === commandName || (cmd.config.aliases && cmd.config.aliases.includes(commandName)));

            if (command) {
                const { name, description, aliases, category, version, role, cooldowns, author, usage } = command.config;
                const roleText = role === 0 ? 'All users' : role === 1 ? 'Group admin' : 'Bot admin';
                bot.sendMessage(msg.chat.id, `
━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
━━━━━━━━━━━━━━━━━━━━━━
» Description: ${description}
» Other names: ${aliases.join(', ')}
» Category: ${category}
» Version: ${version}
» Permission: ${roleText}
» Time per command: ${cooldowns} seconds
» Author: ${author}
━━━━━━━━━━  ❖  ━━━━━━━━━━
» Usage guide:
${usage}
━━━━━━━━━━  ❖  ━━━━━━━━━━
» Notes:
• The content inside <XXXXX> can be changed
• The content inside [a|b|c] is a or b or c
                `);
            } else {
                bot.sendMessage(msg.chat.id, `Command not found. Use ${config.prefix}help to see available commands.`, { replyToMessage: msg.message_id });
            }
        } else {
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
            helpMessage += `[ 🐉 | ${config.botName} ]`;

            bot.sendMessage(msg.chat.id, helpMessage);
        }
    }
};
