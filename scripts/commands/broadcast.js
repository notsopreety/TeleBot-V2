const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: 'broadcast',
        aliases: ['noti'],
        category: 'admin',
        role: 2, // Only bot admin can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Broadcast a message to all threads in the database.',
        usage: 'broadcast [message]'
    },

    onStart: async function({ msg, bot, args, config, senderName, userId, username, copyrightMark }) {
        const message = args.join(' '); // Join the arguments into a single string
        if (!message) {
            return bot.sendMessage(msg.chat.id, 'Please provide a message to broadcast.');
        }

        const uri = config.mongoURI;

        try {
            // Connect to the MongoDB database
            const client = new MongoClient(uri);
            await client.connect();

            // Access the threads collection
            const db = client.db();
            const threadsCollection = db.collection('threads');

            // Fetch all threads from the collection
            const threads = await threadsCollection.find({}, { projection: { chatId: 1 } }).toArray();

            // Get the current time in 'Asia/Kathmandu' timezone
            const currentTime = moment().tz('Asia/Kathmandu').format('MMMM Do, YYYY [at] HH:mm:ss');

            // Send the message to each thread
            for (const thread of threads) {
                const broadcast = `
📢 <b>Broadcast Message</b> 📢
━━━━━━━━━━━━━━━━━━━━━━
Message: ${message}
━━━━━━━━━━━━━━━━━━━━━━
Time: ${currentTime}
━━━━━━━━━━  ❖  ━━━━━━━━━━
» Sender Name: ${senderName}
» Username: @${username}
» UserID: ${userId}
━━━━━━━━━━  ❖  ━━━━━━━━━━
${copyrightMark}
                `;
                await bot.sendMessage(thread.chatId, broadcast, { parseMode: 'html' });
            }

            // Close the database connection
            await client.close();
        } catch (error) {
        }
    }
};
