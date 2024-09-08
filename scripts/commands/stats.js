const os = require('os');
const process = require('process');
const fs = require('fs');
const FastSpeedtest = require('fast-speedtest-api');
const Thread = require('../../database/models/thread');
const User = require('../../database/models/user');
const axios = require('axios');

const speedtest = new FastSpeedtest({
    token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm', // Replace with your FastSpeedtest API token
    verbose: false,
    timeout: 10000,
    https: true,
    urlCount: 5,
    bufferSize: 8,
    unit: FastSpeedtest.UNITS.Mbps,
});

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

    onStart: async function ({ bot, chatId, msg }) {
        try {
            // Send initial message
            const preMessage = await bot.sendMessage(chatId, 'Fetching bot statistics... Please wait.', { replyToMessage: msg.message_id });

            // Retrieve uptime and memory usage
            const uptime = process.uptime();
            const uptimeString = formatUptime(uptime);
            const memoryUsage = process.memoryUsage();
            const memoryUsageMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);
            const jsFileCount = countJSFiles();
            const diskStats = getDiskStats();
            
            // Retrieve internet speed
            const internetSpeed = await getInternetSpeed();

            // Retrieve user and thread counts
            const userCount = await User.countDocuments();
            const threadCount = await Thread.countDocuments();

            // Final message with all statistics
            const statsMessage = `
📊 Bot Statistics 📊

🕒 Uptime: ${uptimeString}
💾 Memory Usage: ${memoryUsageMB} MB
📂 Total Commands: ${jsFileCount}
💽 Disk Total: ${diskStats.total} GB, Free: ${diskStats.free} GB
🌐 Internet Speed: ${internetSpeed} Mbps
👤 Total Users: ${userCount}
🧵 Total Threads: ${threadCount}
`;

            await bot.editMessageText({ chatId: chatId, messageId: preMessage.message_id }, statsMessage, { replyToMessage: msg.message_id });

        } catch (error) {
            console.error('[ERROR]', error);
            await bot.editMessageText({ chatId: chatId, messageId: preMessage.message_id }, 'An error occurred while fetching the stats.', { replyToMessage: msg.message_id });
        }
    }
};

// Function to format uptime
function formatUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Function to count JavaScript files in the command directory
function countJSFiles() {
    const cmdDir = __dirname;
    const files = fs.readdirSync(cmdDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));
    return jsFiles.length;
}

// Function to get disk statistics
function getDiskStats() {
    const total = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2); // Total disk space
    const free = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2); // Free disk space
    return { total, free };
}

// Function to get internet speed
async function getInternetSpeed() {
    try {
        const speed = await speedtest.getSpeed();
        return speed.toFixed(2); // Round to 2 decimal places
    } catch (error) {
        console.error('[ERROR] Internet speed test failed:', error);
        return 'N/A';
    }
}
