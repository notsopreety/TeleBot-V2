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
        usage: "xnxx <title or video_url>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No search query or URL provided. Usage: /xnxx <title or url>', { replyToMessage: msg.message_id });
            }

            const queryOrUrl = args.join(' ');

            let videoMetadata;
            let downloadLink;

            // Check if the input is a direct video URL or a search query
            if (queryOrUrl.includes('xnxx.com')) {
                // Direct video URL
                downloadLink = queryOrUrl;
            } else {
                // Search for videos based on the query
                const searchResponse = await axios.get(`https://samirxpikachu.onrender.com/xnxx/search?query=${encodeURIComponent(queryOrUrl)}`);
                const searchResults = searchResponse.data;

                if (!searchResults.length) {
                    throw new Error('No videos found for the given query.');
                }

                // Use the first search result
                videoMetadata = searchResults[0];
                downloadLink = await fetchDownloadLink(videoMetadata.link); // Fetch download link for the video
            }

            // Download the video file
            const downloadMsg = await bot.sendMessage(msg.chat.id, `⏳ Downloading ${videoMetadata.title}...`, { replyToMessage: msg.message_id });

            // Create directory if it doesn't exist
            const directoryPath = path.join(__dirname, 'cache');
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            // Temporary file path
            const filePath = path.join(directoryPath, `${videoMetadata.title.replace(/[^\w\s]/gi, '')}.mp4`);

            // Download video stream
            const videoStream = await axios({
                method: 'GET',
                url: downloadLink,
                responseType: 'stream'
            });

            // Write video stream to file
            const fileWriteStream = fs.createWriteStream(filePath);
            videoStream.data.pipe(fileWriteStream);

            fileWriteStream.on('finish', async () => {
                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

                if (fileSizeInBytes > 50 * 1024 * 1024) { // Telegram has a file size limit of 50MB
                    fs.unlinkSync(filePath);
                    return bot.sendMessage(msg.chat.id, '❌ The file could not be sent because it is larger than 50MB.', { replyToMessage: msg.message_id });
                }

                const caption = `<b>Title:</b> ${videoMetadata.title}\n<b>Views:</b> ${videoMetadata.views}\n<b>Quality:</b> ${videoMetadata.quality}\n<b>Duration:</b> ${videoMetadata.duration}`;

                await bot.sendVideo(msg.chat.id, fs.createReadStream(filePath), { caption, parseMode: 'HTML' });

                // Delete the file after sending the response
                fs.unlinkSync(filePath);
            });

            fileWriteStream.on('error', (error) => {
                console.error('[ERROR]', error);
                bot.sendMessage(msg.chat.id, 'An error occurred while writing the file.', { replyToMessage: msg.message_id });
            });

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(msg.chat.id, 'An error occurred while processing the command.', { replyToMessage: msg.message_id });
        }
    }
};

async function fetchDownloadLink(videoUrl) {
    try {
        const downloadResponse = await axios.get(`https://samirxpikachu.onrender.com/xnxx/down?url=${encodeURIComponent(videoUrl)}`);
        const downloadData = downloadResponse.data;

        if (!downloadData.url) {
            throw new Error('Failed to get download link for the video.');
        }

        return downloadData.url;
    } catch (error) {
        console.error('[ERROR] Fetching download link:', error);
        throw new Error('Failed to get download link for the video.');
    }
}
