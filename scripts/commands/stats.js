const os = require('os');
const process = require('process');
const fs = require('fs');

module.exports = {
    config: {
        name: "stats",
        aliases: ["botstats", "statistics"],
        role: 2,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Œ',
        category: "admin",
        description: "Display bot statistics.",
        usage: "stats",
    },

    onStart: async function ({ bot, chatId,msg }) {
        try {
            const uptime = process.uptime(); 
            const uptimeString = formatUptime(uptime);

            const memoryUsage = process.memoryUsage();
            const memoryUsageMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);

            const jsFileCount = countJSFiles();

            const statsMessage = `
📊 Bot Statistics 📊

🕒 Uptime: ${uptimeString}
💾 Memory Usage: ${memoryUsageMB} MB           
📂 total cmds: ${jsFileCount}
`;

            bot.sendMessage(chatId, statsMessage, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, 'An error occurred while fetching the stats.', { replyToMessage: msg.message_id });
        }
    }
};

function formatUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}


function countJSFiles() {
    const cmdDir = __dirname;
    const files = fs.readdirSync(cmdDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    return jsFiles.length;
}
