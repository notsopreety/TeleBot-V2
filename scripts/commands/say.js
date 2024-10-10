const { createReadStream, unlinkSync, createWriteStream, existsSync, mkdirSync } = require("fs-extra");
const { resolve } = require("path");
const axios = require("axios");


// List of supported languages
const supportedLanguages = ["af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "ny", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "he", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "kk", "km", "rw", "ko", "ku", "ky", "lo", "la", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "or", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "tt", "te", "th", "tr", "tk", "uk", "ur", "ug", "uz", "vi", "cy", "xh", "yi", "yo", "zu"];

// Function to fetch audio data from Google Translate TTS API
async function fetchTTS(text, langCode) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
    return await axios({
        method: "GET",
        url,
        responseType: "stream",
    });
}

module.exports = {
    config: {
        name: 'say',
        aliases: ['tts'],
        category: 'general',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Convert text to speech with specified language',
        usage: 'say -<language code> <text> - Convert text to speech in the specified language.\n/say <text> - Convert text to speech in English (default).\n/say -<language code> <reply to message> - Convert replied message text to speech in the specified language.',
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            const { chat, reply_to_message } = msg;
            const chatId = chat.id;

            if (args.length === 0 && !reply_to_message) {
                await bot.sendMessage(chatId, "Please provide a language code and message or reply to a message for TTS.", { replyToMessage: msg.message_id });
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
                        await bot.sendMessage(chatId, "Please provide a text to convert to speech.", { replyToMessage: msg.message_id });
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

            const cacheDir = resolve(__dirname, "cache");
            if (!existsSync(cacheDir)) {
                mkdirSync(cacheDir);
            }

            const filePath = resolve(cacheDir, `${chatId}_${msg.from.id}.mp3`);
            const response = await fetchTTS(text, langCode);

            const writer = response.data.pipe(createWriteStream(filePath));
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            await bot.sendAudio(chatId, createReadStream(filePath), { replyToMessage: msg.message_id });

            unlinkSync(filePath); // Clean up the file after sending
        } catch (error) {
            console.error('Error in TTS command:', error);
            await bot.sendMessage(chatId, "Error occurred during TTS conversion.", { replyToMessage: msg.message_id });
        }
    },
};