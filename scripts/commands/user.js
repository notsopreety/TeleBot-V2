const mongoose = require('mongoose');
const User = require('../../database/models/user'); // Ensure this path is correct

module.exports = {
    config: {
        name: 'user',
        aliases: [],
        category: 'admin',
        role: 2, // Bot admins only
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Ban, unban users or list users in the database',
        usage: '/user <ban/unban/list> <reply/user_id>',
    },

    onStart: async function ({ msg, bot, args }) {
        if (args.length === 0) {
            return bot.sendMessage(msg.chat.id, 'Usage: /user <ban/unban/list> <reply/user_id>');
        }

        const action = args[0].toLowerCase();

        try {
            if (action === 'list') {
                const userCount = await User.countDocuments({});
                return bot.sendMessage(msg.chat.id, `Total number of users: ${userCount}`);
            }

            let userId;
            let userFirstName;
            let userLastName;
            let username;

            if (msg.reply_to_message) {
                userId = msg.reply_to_message.from.id;
                userFirstName = msg.reply_to_message.from.first_name;
                userLastName = msg.reply_to_message.from.last_name;
                username = msg.reply_to_message.from.username;
            } else if (args.length > 1) {
                userId = args[1];
                const user = await bot.getChatMember(msg.chat.id, userId);
                userFirstName = user.user.first_name;
                userLastName = user.user.last_name;
                username = user.user.username;
            } else {
                return bot.sendMessage(msg.chat.id, 'Please provide a user to ban or unban by replying or providing their user ID.');
            }

            if (!userId) {
                return bot.sendMessage(msg.chat.id, 'Unable to determine the user ID.');
            }

            let user = await User.findOne({ userID: userId });
            if (!user) {
                return bot.sendMessage(msg.chat.id, `Can't ${action} ${userFirstName ? userFirstName : userId}. User doesn't exist in bot's database.`);
            }

            if (action === 'ban') {
                user = await User.findOneAndUpdate({ userID: userId }, { banned: true }, { new: true, upsert: false });
                bot.sendMessage(msg.chat.id, `Successfully banned ${userFirstName} ${userLastName} from using the bot.`);
            } else if (action === 'unban') {
                user = await User.findOneAndUpdate({ userID: userId }, { banned: false }, { new: true, upsert: false });
                bot.sendMessage(msg.chat.id, `Successfully unbanned ${userFirstName} ${userLastName} from using the bot.`);
            } else {
                bot.sendMessage(msg.chat.id, 'Invalid action. Use "ban", "unban", or "list".');
            }
        } catch (error) {
            console.error('Error executing user command:', error);
            bot.sendMessage(msg.chat.id, 'Error executing user command.');
        }
    }
};
