const Thread = require('../../database/models/thread'); // Ensure this path is correct

module.exports = {
    config: {
        name: 'threaduser',
        aliases: ['tuser', 'gcuser'],
        category: 'admin',
        role: 2, // Bot admins only
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Ban or unban users in a specific group chat.',
        usage: 'threaduser <ban/unban> <reply/user_id>',
    },

    onStart: async function ({ msg, bot, args }) {
        if (args.length === 0) {
            return bot.sendMessage(msg.chat.id, 'Usage: /threaduser <ban/unban> <reply/user_id>', { replyToMessage: msg.message_id });
        }

        const action = args[0].toLowerCase();
        const chatId = msg.chat.id.toString();
        let userId;
        let userFirstName;
        let userLastName;
        let username;

        // Determine user ID based on reply or argument
        if (msg.reply_to_message) {
            userId = msg.reply_to_message.from.id.toString(); // Convert to string
            userFirstName = msg.reply_to_message.from.first_name;
            userLastName = msg.reply_to_message.from.last_name;
            username = msg.reply_to_message.from.username;
        } else if (args.length > 1) {
            userId = args[1].toString(); // Convert to string
            try {
                const user = await bot.getChatMember(chatId, userId);
                userFirstName = user.user.first_name;
                userLastName = user.user.last_name;
                username = user.user.username;
            } catch (error) {
                return bot.sendMessage(msg.chat.id, 'Invalid user ID or user not found.', { replyToMessage: msg.message_id });
            }
        } else {
            return bot.sendMessage(msg.chat.id, 'Please provide a user to ban or unban by replying to their message or providing their user ID.', { replyToMessage: msg.message_id });
        }

        if (!userId) {
            return bot.sendMessage(msg.chat.id, 'Unable to determine the user ID.', { replyToMessage: msg.message_id });
        }

        try {
            let thread = await Thread.findOne({ chatId });
            if (!thread) {
                thread = new Thread({ chatId });
                await thread.save();
                console.log(`[DATABASE] New thread: ${chatId} database has been created!`);
            }

            let userInThread = thread.users.get(userId);
            if (!userInThread) {
                userInThread = { gcBan: false };
            }

            if (action === 'ban') {
                userInThread.gcBan = true;
                thread.users.set(userId, userInThread);
                await thread.save();
                bot.sendMessage(msg.chat.id, `Successfully banned ${userFirstName} ${userLastName} from using the bot in this group.`, { replyToMessage: msg.message_id });
            } else if (action === 'unban') {
                userInThread.gcBan = false;
                thread.users.set(userId, userInThread);
                await thread.save();
                bot.sendMessage(msg.chat.id, `Successfully unbanned ${userFirstName} ${userLastName} from using the bot in this group.`, { replyToMessage: msg.message_id });
            } else {
                bot.sendMessage(msg.chat.id, 'Invalid action. Use "ban" or "unban".', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error executing threaduser command:', error);
            bot.sendMessage(msg.chat.id, 'Error executing threaduser command.', { replyToMessage: msg.message_id });
        }
    }
};
