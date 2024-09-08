const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'html2img',
        aliases: ['htmlimg', 'renderhtml'],
        category: 'tools',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Convert provided HTML into an image',
        usage: 'html2img <HTML>'
    },

    onStart: async function({ msg, bot, args }) {
        if (args.length === 0) {
            return bot.sendMessage(msg.chat.id, '❌ No HTML provided. Usage: /html2img <HTML>', { replyToMessage: msg.message_id });
        }

        const htmlContent = args.join(' '); // Join the arguments as the HTML content
        const cacheDir = path.join(__dirname, 'cache');
        const imagePath = path.join(cacheDir, 'rendered.png');

        // Ensure the cache directory exists
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        try {
            // Launch puppeteer browser and render the HTML
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // Set the HTML content to be rendered
            await page.setContent(htmlContent);

            // Take a screenshot of the rendered HTML
            await page.screenshot({ path: imagePath, fullPage: true });

            // Close the browser
            await browser.close();

            // Send the image as a message
            await bot.sendPhoto(msg.chat.id, imagePath, { caption: 'Here is the rendered HTML output!' }, { replyToMessage: msg.message_id });

            // Optionally, delete the image after sending to save space
            fs.unlinkSync(imagePath);

        } catch (error) {
            console.error('Error rendering HTML to image:', error);
            bot.sendMessage(msg.chat.id, '❌ Error rendering HTML to image.', { replyToMessage: msg.message_id });
        }
    }
};
