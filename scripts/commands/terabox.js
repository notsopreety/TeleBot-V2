const downloadFromTerabox = require('../../utils/terabox');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: 'terabox',
        aliases: ['teradl', 'tbdl', 'tera'],
        category: 'downloader',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download Terabox video',
        usage: 'terabox <URL>'
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, "No URL provided", { replyToMessage: msg.message_id });
            }

            await bot.sendMessage(msg.chat.id, '⏳ Downloading Video...', { replyToMessage: msg.message_id });

            const videoUrl = args[0];
            const apiUrl = 'https://ytshorts.savetube.me/api/v1/terabox-downloader';
            const payload = { url: videoUrl };

            const response = await axios.post(apiUrl, payload);
            const data = response.data;

            if (data && data.response && data.response[0].resolutions && data.response[0].resolutions['Fast Download']) {
                const fastDownloadUrl = data.response[0].resolutions['Fast Download'];
                const title = data.response[0].title;

                // Save the video locally
                const videoPath = path.join(__dirname, 'cache', `${title}.mp4`);
                const writer = fs.createWriteStream(videoPath);
                const videoResponse = await axios.get(fastDownloadUrl, { responseType: 'stream' });
                videoResponse.data.pipe(writer);

                writer.on('finish', async () => {
                    // Send the video along with the message and react with success
                    const message = `*Title:* ${title}`;
                    await bot.sendVideo(msg.chat.id, videoPath, { caption: message }, { replyToMessage: msg.message_id });

                    // Delete the video file
                    fs.unlinkSync(videoPath);
                });

                writer.on('error', async (err) => {
                    console.error('Error saving video:', err);
                    await bot.sendMessage(msg.chat.id, 'Error saving video', { replyToMessage: msg.message_id });
                });
            } else {
                await bot.sendMessage(msg.chat.id, 'No fast download video found! Something went wrong.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error fetching or sending video:', error);
            await bot.sendMessage(msg.chat.id, 'Error fetching or sending video', { replyToMessage: msg.message_id });
        }
    },
};
