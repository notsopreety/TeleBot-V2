const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "xnxx",
        aliases: ["porn"],
        category: "downloader",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Download video from xnxx",
        usage: "xnxx <video_url>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, "No URL provided");
            }

            const downloadMsg = await bot.sendMessage(msg.chat.id, '⏳ Downloading video from XNXX...');

            const url = `https://apidown.site/api/xvideos/v1?link=${encodeURIComponent(args[0])}`;
            const response = await axios.get(url);
            const data = response.data;

            if (data.result && data.result.title && data.result.url) {
                const message = `Title: ${data.result.title}\n\nKeyword: ${data.result.keyword}`;

                // Download the video
                const videoPath = path.join(__dirname, 'cache', `xnxx_${Date.now()}.mp4`);
                const writer = fs.createWriteStream(videoPath);
                const videoResponse = await axios.get(data.result.url, { responseType: 'stream' });
                videoResponse.data.pipe(writer);
                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

                writer.on('finish', async () => {
                    // Send the video to the user
                    await bot.sendVideo(msg.chat.id, videoPath, { caption: message });

                    // Delete the video file after sending
                    fs.unlinkSync(videoPath);
                });

                writer.on('error', async (err) => {
                    console.error('Error saving XNXX video:', err);
                    await bot.sendMessage(msg.chat.id, 'Error saving XNXX video');
                });
            } else {
                await bot.sendMessage(msg.chat.id, 'No video found! Something went wrong.');
            }
        } catch (error) {
            console.error('Error fetching or sending video from XNXX:', error);
            await bot.sendMessage(msg.chat.id, 'Error fetching or sending video from XNXX');
        }
    },
};
