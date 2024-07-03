const moment = require('moment-timezone');

module.exports = {
    config: {
        name: 'time',
        aliases: ['currenttime'],
        category: 'utility',
        role: 2,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get the current time.',
        usage: 'time \nSuggesting admin not to use this command. This may hang out bot socket.'
    },

    onStart: async function({ msg, bot, chatId, userId }) {
        return bot.sendMessage(chatId, 'Getting time...', { replyToMessage: msg.message_id }).then(re => {
            // Start updating message
            updateTime(chatId, re.message_id, bot);
        });
    }
};

function updateTime(chatId, messageId, bot) {
    // Update every second
    setInterval(() => {
        bot.editMessageText(
            {chatId, messageId}, `<b>Current time:</b> ${ time() }`,
            {parseMode: 'html'}, 
            { replyToMessage: msg.message_id }
        ).catch(error => console.log('Error:', error));
    }, 1000);
}

// Get current time
function time() {
    return new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}
