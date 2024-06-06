const path = require('path');
module.exports = {
    config: {
        name: 'leftChatMember',
        description: 'Farewell event for left members',
        author: 'Samir Thakuri'
    },

    onEvent: async function({ bot, msg, config }) {
        const leftMember = msg.left_chat_member;
        const chatId = msg.chat.id;

        // Check if farewell message for left members is enabled in config
        if (!config.farewellMembers.enabled) {
            return; // Exit if farewell message is disabled
        }

        // Check if the member left voluntarily or was kicked
        if (msg.from.id === leftMember.id) {
            // Member left voluntarily
            const leaveMessages = [
                `Oh no! ${leftMember.username ? `@${leftMember.username}` : leftMember.first_name} slipped on a banana peel and fell out of the group. 🍌👋`,
                // Other farewell messages...
            ];
            const randomLeaveMessage = leaveMessages[Math.floor(Math.random() * leaveMessages.length)];
            bot.sendAnimation(chatId, config.farewellMembers.gifUrl, { caption: randomLeaveMessage, reply_markup: { remove_keyboard: true } });
        } else {
            // Member was kicked by admin
            const kickedBy = msg.from;
            const kickMessages = [
                `Looks like ${kickedBy.username ? `@${kickedBy.username}` : kickedBy.first_name} gave ${leftMember.username ? `@${leftMember.username}` : leftMember.first_name} the boot! 😡👢`,
                // Other kick messages...
            ];
            const randomKickMessage = kickMessages[Math.floor(Math.random() * kickMessages.length)];
            bot.sendAnimation(chatId, config.farewellMembers.gifUrl, { caption: randomKickMessage, reply_markup: { remove_keyboard: true } });
        }
    }
};
