module.exports = {
    config: {
        name: 'text', // The event name should match the TeleBot event
        description: 'Handles incoming text messages',
        author: 'Samir Thakuri'
    },
    onEvent: async function({ bot, threadModel, userModel, msg, config }) {
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();

        // Logging received messages
        console.log(`Received message from ${userId} in ${chatId}: ${msg.text}`);

        // Create or update user and thread in database
        let user = await userModel.findOne({ userID: userId });
        if (!user) {
            user = new userModel({
                userID: userId,
                username: msg.from.username,
                first_name: msg.from.first_name,
                last_name: msg.from.last_name
            });
            await user.save();
            console.log(`[DATABASE] New user: ${userId} database has been created!`);
        }

        let thread = await threadModel.findOne({ chatId });
        if (!thread) {
            thread = new threadModel({ chatId });
            await thread.save();
            console.log(`[DATABASE] New thread: ${chatId} database has been created!`);
        }

        if (!thread.users) {
            thread.users = new Map();
        }

        if (!thread.users.has(userId)) {
            thread.users.set(userId, { totalMsg: 1 });
        } else {
            thread.users.get(userId).totalMsg += 1;
        }
        await thread.save();
        const userMessage = msg.text.toLowerCase(); // Convert message to lowercase for case-insensitive comparison
        const prefixWords = ['prefix']; // Define words that trigger the response
        // Check if the user message includes any of the prefix words
        if (prefixWords.includes(userMessage)) {
            bot.sendMessage(chatId, `The bot's prefix is: ${config.prefix}`, { replyToMessage: msg.message_id });
        }
    }
};
