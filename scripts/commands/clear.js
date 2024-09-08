const fs = require('fs').promises;
const path = require('path');

module.exports = {
    config: {
        name: 'clear',
        aliases: ['cache', 'cleanup'],
        category: 'utility',
        role: 2,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Clear cache and temp data files from bot\'s system',
        usage: 'clear [cache|temp]',
    },

    onStart: async function ({ msg, bot, args }) {
        const type = args[0] ? args[0].toLowerCase() : 'cache';
        let dirPath;

        // Determine the directory based on the command argument
        if (type === 'cache') {
            dirPath = path.join(__dirname, 'cache');
        } else if (type === 'temp') {
            dirPath = path.join(__dirname, 'temp');
        } else {
            return bot.sendMessage(msg.chat.id, 'Invalid type specified. Use `cache` or `temp`.', { replyToMessage: msg.message_id });
        }

        try {
            const files = await fs.readdir(dirPath);

            // Filter out .gitkeep file
            const filesToDelete = files.filter(file => file !== '.gitkeep');

            if (filesToDelete.length === 0) {
                return bot.sendMessage(msg.chat.id, `No ${type} files to delete.`, { replyToMessage: msg.message_id });
            }

            let totalDeleted = 0;
            for (const file of filesToDelete) {
                await fs.unlink(path.join(dirPath, file));
                totalDeleted++;
            }

            bot.sendMessage(msg.chat.id, `Deleted ${totalDeleted} ${type} file(s) successfully.`, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error(`Error clearing ${type} files:`, error);
            bot.sendMessage(msg.chat.id, `Error clearing ${type} files.`, { replyToMessage: msg.message_id });
        }
    }
};
