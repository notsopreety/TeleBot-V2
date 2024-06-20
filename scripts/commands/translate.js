const axios = require('axios');
const TeleBot = require('telebot');


// List of supported languages
const supportedLanguages = ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "ny", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"];

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
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Translate messages to the specified language",
        usage: "/trans -<language code> <text> - Translate text to the specified language.\n/trans <text> - Translate text to English (default).\n/trans -<language code> <reply to message> - Translate replied message text to the specified language.",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            const { chat, reply_to_message } = msg;
            const chatId = chat.id;

            if (args.length === 0 && !reply_to_message) {
                await bot.sendMessage(chatId, "Please provide a language code and message or reply to a message to translate.", { replyToMessage: msg.message_id });
                return;
            }

            let langCode = "en";
            let text;

            if (args.length >= 1) {
                const firstArg = args[0].toLowerCase();
                if (firstArg.startsWith('-')) {
                    langCode = firstArg.slice(1); // Remove the hyphen to get the langCode
                    if (!supportedLanguages.includes(langCode)) {
                        await bot.sendMessage(chatId, "Please provide a valid language code.", { replyToMessage: msg.message_id });
                        return;
                    }
                    if (args.length >= 2) {
                        text = args.slice(1).join(" ");
                    } else if (reply_to_message) {
                        text = reply_to_message.text;
                    } else {
                        await bot.sendMessage(chatId, "Please provide a text to translate.", { replyToMessage: msg.message_id });
                        return;
                    }
                } else {
                    text = args.join(" ");
                }
            } else if (reply_to_message) {
                text = reply_to_message.text;
                if (args.length === 1) {
                    const firstArg = args[0].toLowerCase();
                    if (firstArg.startsWith('-')) {
                        langCode = firstArg.slice(1); // Remove the hyphen to get the langCode
                        if (!supportedLanguages.includes(langCode)) {
                            await bot.sendMessage(chatId, "Please provide a valid language code.", { replyToMessage: msg.message_id });
                            return;
                        }
                    }
                }
            }

            // Perform translation
            const translationResult = await translate(text, langCode);

            // Compose the translated message
            const replyMessage = `🌐 Translate from ${translationResult.lang} to ${langCode}\n${translationResult.text}`;

            // Send the translated message
            await bot.sendMessage(chatId, replyMessage, { replyToMessage: msg.message_id });
        } catch (error) {
            console.error('Error in translation command:', error);
            await bot.sendMessage(chatId, "Error occurred during translation.", { replyToMessage: msg.message_id });
        }
    },
};