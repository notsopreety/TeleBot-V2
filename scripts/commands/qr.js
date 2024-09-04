const QRCode = require('qrcode');
const QRCodeReader = require('qrcode-reader');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

module.exports = {
    config: {
        name: "qr",
        alias: ["qrcoder"],
        category: "utility",
        role: 0,
        cooldowns: 10,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Create and scan QR codes",
        usage: "/qr create <text> or /qr scan <reply to image>"
    },

    onStart: async function ({ bot, msg, args, config }) {
        const command = args[0];
        const chatId = msg.chat.id;

        if (command === 'create') {
            const text = args.slice(1).join(' ');
            if (!text) {
                return bot.sendMessage(chatId, "⚠️ Please provide text to create a QR code.", { replyToMessage: msg.message_id });
            }

            try {
                // Generate QR code
                const qrImage = await QRCode.toBuffer(text);
                const filePath = path.join(__dirname, 'temp', 'qrcode.png');
                fs.writeFileSync(filePath, qrImage);

                // Send QR code image
                await bot.sendPhoto(chatId, filePath, { caption: `Here's your QR code for: ${text}` });

                // Clean up
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error('Error generating QR code:', error);
                await bot.sendMessage(chatId, "⚠️ Failed to create QR code. Please try again later.", { replyToMessage: msg.message_id });
            }
        } else if (command === 'scan') {
            if (!msg.reply_to_message || !msg.reply_to_message.photo) {
                return bot.sendMessage(chatId, "⚠️ Please reply to an image with the QR code.", { replyToMessage: msg.message_id });
            }

            try {
                // Download the image
                const fileId = msg.reply_to_message.photo[0].file_id;
                const file = await bot.getFile(fileId);
                const fileUrl = `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`;
                const imageResponse = await fetch(fileUrl);
                const buffer = await imageResponse.buffer();

                // Save the image to temp folder
                const tempPath = path.join(__dirname, 'temp', 'qrcode_to_scan.png');
                fs.writeFileSync(tempPath, buffer);

                // Read QR code
                const image = await Jimp.read(tempPath);
                const qr = new QRCodeReader();
                qr.callback = (err, value) => {
                    if (err) {
                        console.error('Error reading QR code:', err);
                        bot.sendMessage(chatId, "⚠️ Failed to scan QR code. Please try again.", { replyToMessage: msg.message_id });
                    } else {
                        bot.sendMessage(chatId, `QR Code content: ${value.result}`, { replyToMessage: msg.message_id });
                    }
                    // Clean up
                    fs.unlinkSync(tempPath);
                };
                qr.decode(image.bitmap);
            } catch (error) {
                console.error('Error processing QR code scan:', error);
                bot.sendMessage(chatId, "⚠️ Failed to scan QR code. Please try again later.", { replyToMessage: msg.message_id });
            }
        } else {
            bot.sendMessage(chatId, `⚠️ Invalid command. Use /qr create <text> or /qr scan <reply to image>`, { replyToMessage: msg.message_id });
        }
    }
};
