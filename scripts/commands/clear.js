const fs = require('fs').promises;
const path = require('path');

module.exports = {
    config: {
        name: 'clear',
        aliases: ['cache'],
        category: 'utility',
        role: 2, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Clear cache data files from bot\'s system',
        usage: 'clear',
    },

    onStart: async function ({ msg, bot }) {
        try {
            const cacheDir = path.join(__dirname, 'cache'); // Adjust path as needed
            const files = await fs.readdir(cacheDir);

            // Filter out .gitkeep file
            const filesToDelete = files.filter(file => file !== '.gitkeep');

            if (filesToDelete.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No cache files to delete.', { replyToMessage: msg.message_id });
            }

            let totalDeleted = 0;
            for (const file of filesToDelete) {
                await fs.unlink(path.join(cacheDir, file));
                totalDeleted++;
            }

            bot.sendMessage(msg.chat.id, `Deleted ${totalDeleted} cache file(s) successfully.`, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('Error clearing cache:', error);
            bot.sendMessage(msg.chat.id, 'Error clearing cache.', { replyToMessage: msg.message_id });
        }
    }
};
