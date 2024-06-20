const { createWriteStream, unlinkSync, existsSync, mkdirSync } = require("fs-extra");
const { resolve } = require("path");
const axios = require("axios");
const Tesseract = require('tesseract.js');


// Function to clean up extracted text
function cleanText(text) {
    return text
        .replace(/[^\w\s.,!?-]/g, '') // Remove unwanted symbols, keeping common punctuation
        .replace(/\s+/g, ' ')         // Replace multiple whitespace with single space
        .trim();                      // Trim leading and trailing spaces
}

module.exports = {
    config: {
        name: 'ocr',
        aliases: ['extracttext'],
        category: 'utility',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Extract text from an image by replying to the image message.',
        usage: '/ocr - Extract text from a replied image message.',
    },

    onStart: async function ({ bot, msg, config }) {
        const chatId = msg.chat.id;  // Ensure chatId is defined at the beginning

        try {
            const { reply_to_message } = msg;

            if (!reply_to_message || !reply_to_message.photo) {
                await bot.sendMessage(chatId, "Please reply to an image message to extract text.", { replyToMessage: msg.message_id });
                return;
            }

            const fileId = reply_to_message.photo[reply_to_message.photo.length - 1].file_id;
            const file = await bot.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`;

            const cacheDir = resolve(__dirname, "cache");
            if (!existsSync(cacheDir)) {
                mkdirSync(cacheDir);
            }

            const filePath = resolve(cacheDir, `${chatId}_${msg.from.id}.jpg`);
            const response = await axios({
                method: "GET",
                url: fileUrl,
                responseType: "stream",
            });

            const writer = response.data.pipe(createWriteStream(filePath));
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // Perform OCR with auto language detection
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
                langPath: 'https://tessdata.projectnaptha.com/4.0.0_best/',
                logger: m => console.log(m),
                tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_ONLY,
            });

            const cleanedText = cleanText(text);

            await bot.sendMessage(chatId, `Extracted Text:\n${cleanedText}`, { replyToMessage: msg.message_id });

            unlinkSync(filePath); // Clean up the file after sending
        } catch (error) {
            console.error('Error in OCR command:', error);
            await bot.sendMessage(chatId, "Error occurred during OCR processing.", { replyToMessage: msg.message_id });
        }
    },
};