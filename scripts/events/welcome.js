const path = require('path');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: 'newChatMembers',
        description: 'Welcome event for new users',
        author: 'Your Name'
    },

    onEvent: async function({ bot, msg, config }) {
        const newMember = msg.new_chat_members[0];
        const chatId = msg.chat.id;
        const groupName = msg.chat.title;

        // Check if greeting new members is enabled in config
        if (!config.greetNewMembers.enabled) {
            return; // Exit if greeting new members is disabled
        }

        // Set timezone to Asia/Kathmandu
        moment.tz.setDefault('Asia/Kathmandu');

        // Get the current time and date
        const currentTime = moment();
        const currentHour = currentTime.hour();

        // Determine the session based on the current time
        let session = '';
        if (currentHour >= 0 && currentHour < 5) {
            session = 'late night';
        } else if (currentHour >= 5 && currentHour < 10) {
            session = 'early morning';
        } else if (currentHour >= 10 && currentHour < 12) {
            session = 'late morning';
        } else if (currentHour >= 12 && currentHour < 16) {
            session = 'afternoon';
        } else if (currentHour >= 16 && currentHour < 18) {
            session = 'early evening';
        } else if (currentHour >= 18 && currentHour < 20) {
            session = 'late evening';
        } else if (currentHour >= 20 && currentHour < 24) {
            session = 'night';
        }

        // Get the member count
        const memberCount = await bot.getChatMembersCount(chatId);

        // Mention the new user and include member count in the welcome message
        let welcomeMessage = `Hello @${newMember.username}, Welcome to ${groupName}.\n` +
            `You are the ${ordinalSuffix(memberCount)} member.\n` +
            `Join time: ${currentTime.format('HH:mm:ss')} (${currentTime.format('MMMM Do YYYY')})\n`;

        // Add emotions based on the session
        if (session === 'night') {
            welcomeMessage += `Good ${session}, hope you have a peaceful night! 🌙`;
        } else if (session === 'early morning' || session === 'late morning') {
            welcomeMessage += `Good ${session}, rise and shine! ☀️`;
        } else if (session === 'afternoon') {
            welcomeMessage += `Good ${session}, enjoy your day! 🌤️`;
        } else if (session === 'early evening' || session === 'late evening') {
            welcomeMessage += `Good ${session}, relax and unwind! 🌆`;
        } else {
            welcomeMessage += `Hello and have a nice ${session}!`;
        }

        // Send the welcome message with the animation as a caption if enabled
        if (config.greetNewMembers.enabled) {
            const gifPath = config.greetNewMembers.gifUrl;
            await bot.sendAnimation(chatId, gifPath, { caption: welcomeMessage });
        }
    }
};

// Helper function to add ordinal suffix to numbers (e.g., 1st, 2nd, 3rd)
function ordinalSuffix(number) {
    const j = number % 10, k = number % 100;
    if (j === 1 && k !== 11) {
        return number + "st";
    }
    if (j === 2 && k !== 12) {
        return number + "nd";
    }
    if (j === 3 && k !== 13) {
        return number + "rd";
    }
    return number + "th";
}
