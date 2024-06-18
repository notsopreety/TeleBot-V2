const Thread = require('../../database/models/thread');
const User = require('../../database/models/user');

function getOrdinalSuffix(rank) {
    const j = rank % 10, k = rank % 100;
    if (j === 1 && k !== 11) {
        return `${rank}st`;
    }
    if (j === 2 && k !== 12) {
        return `${rank}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${rank}rd`;
    }
    return `${rank}th`;
}
function getUserRank(rank) {
    return `${rank}`;
}

module.exports = {
    config: {
        name: 'count',
        aliases: [],
        category: 'utility',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Your Name',
        description: 'Count messages and ranks of users in the chat',
        usage: '/count [<user_id>/all]',
    },

    onStart: async function ({ msg, bot, args }) {
        try {
            const chatId = msg.chat.id;
            const thread = await Thread.findOne({ chatId });

            if (!thread) {
                return bot.sendMessage(chatId, 'No message data available for this group.');
            }

            const usersData = thread.users;
            const usersArray = [];

            usersData.forEach((value, key) => {
                usersArray.push({
                    userId: key,
                    totalMsg: parseInt(value.totalMsg),
                });
            });

            usersArray.sort((a, b) => b.totalMsg - a.totalMsg);

            if (args.length === 0) {
                // Count messages for the user who executed the command
                const userId = msg.from.id.toString();
                const userIndex = usersArray.findIndex(user => user.userId === userId);

                if (userIndex === -1) {
                    return bot.sendMessage(chatId, 'You are not in the message data.');
                }

                const totalMsg = usersArray[userIndex].totalMsg;
                const position = getOrdinalSuffix(userIndex + 1);

                return bot.sendMessage(chatId, `You have ranked ${position} position with a total of ${totalMsg} messages.`);
            } else if (args[0] === 'all') {
                // Count messages for all users
                let message = 'Message ranks:\n';
                for (let i = 0; i < usersArray.length; i++) {
                    const user = await User.findOne({ userID: usersArray[i].userId });
                    const rank = getUserRank(i + 1);
                    if (user) {
                        message += `${rank}. ${user.first_name} ${user.last_name} - ${usersArray[i].totalMsg}\n`;
                    } else {
                        message += `${rank}. ${usersArray[i].userId} - ${usersArray[i].totalMsg}\n`;
                    }
                }

                return bot.sendMessage(chatId, message);
            } else {
                // Count messages for the specified user
                const userId = args[0].toString();
                const userIndex = usersArray.findIndex(user => user.userId === userId);

                if (userIndex === -1) {
                    return bot.sendMessage(chatId, `User with ID ${userId} is not in the message data.`);
                }

                const user = await User.findOne({ userID: userId });
                if (!user) {
                    return bot.sendMessage(chatId, `User with ID ${userId} does not exist in the database.`);
                }

                const totalMsg = usersArray[userIndex].totalMsg;
                const position = getOrdinalSuffix(userIndex + 1);

                return bot.sendMessage(chatId, `${user.first_name} ${user.last_name} has ranked ${position} position with a total of ${totalMsg} messages.`);
            }
        } catch (error) {
            console.error('Error executing count command:', error);
            bot.sendMessage(msg.chat.id, 'Error executing count command.');
        }
    }
};
