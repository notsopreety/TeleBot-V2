const axios = require('axios');

// Translate function using Google Translate API
async function translate(text, langCode) {
    try {
        const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
        return {
            text: res.data[0].map(item => item[0]).join(''),
            lang: res.data[2]
        };
    } catch (error) {
        throw new Error('Translation error:', error.message);
    }
}

module.exports = {
    config: {
        name: "trans",
        alias: ["translate"],
        category: "utility",
        description: "Translate messages to the specified language",
        usage: "/trans <language or language code> <reply to user message or text>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            const { chat, from, reply_to_message } = msg;
            const chatId = chat.id;

            if (args.length === 0 && !reply_to_message) {
                await bot.sendMessage(chatId, "Please provide a language code and message or reply to a message to translate.", { replyToMessage: msg.message_id });
                return;
            }

            let langCode;
            let text;

            // Determine if language code and text are provided correctly
            if (args.length >= 2) {
                const potentialLangCode = args[0].toLowerCase();
                // Check if the first argument is a valid language code
                // Replace this with your own logic to validate language codes
                langCode = potentialLangCode;
                text = args.slice(1).join(" ");
            } else if (reply_to_message) {
                // If a message is replied to, extract text from replied message
                text = reply_to_message.text;
            } else {
                // If no valid input is provided
                await bot.sendMessage(chatId, "Please reply to a message to translate or provide both language code and text.", { replyToMessage: msg.message_id });
                return;
            }

            // Perform translation
            const translationResult = await translate(text, langCode || 'en');

            // Compose the translated message
            const replyMessage = `Translation (${translationResult.lang}): \n${translationResult.text}`;

            // Send the translated message
            await bot.sendMessage(chatId, replyMessage, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('Error in translation command:', error);
            await bot.sendMessage(chatId, "Error occurred during translation.", { replyToMessage: msg.message_id });
        }
    },
};
