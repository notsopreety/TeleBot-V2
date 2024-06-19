module.exports = {
    config: {
        name: 'delete',
        aliases: ['del'],
        category: 'utility',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Delete a message sent by the bot by replying to it.',
        usage: 'delete <replytobotmsg>'
    },

    onStart: async function({ msg, bot }) {
        try {
          if (msg.reply_to_message) {
            const chatId = msg.chat.id;
            const messageIDToDelete = msg.reply_to_message.message_id;
            await bot.deleteMessage(chatId, messageIDToDelete);
          } else {
            await bot.sendMessage(msg.chat.id, "Please reply to the message you want to delete.", { replyToMessage: msg.message_id });
          }
        } catch (error) {
          console.log('Error deleting message:', error);
          await bot.sendMessage(msg.chat.id, 'An error occurred while trying to delete the message.', { replyToMessage: msg.message_id });
        }
    }
};
