const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'ytb',
        aliases: ['yt'],
        category: 'media',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download audio or video from YouTube',
        usage: 'ytb [options] <title or url>\n\nOptions:\nFor Audio: -a, a, audio, music\nFor Video: -v, v, video, vid'
    },

    onStart: async function({ msg, bot, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No options or search query provided. Usage: /ytb [options] <title>', { replyToMessage: msg.message_id });
            }

            // Determine the download type (audio or video)
            const option = args[0].toLowerCase();
            let downloadType = 'audio';
            let searchQuery = args.slice(1).join(' ');

            if (option === '-v' || option === 'v' || option === 'video'| option === 'vid') {
                downloadType = 'video';
                searchQuery = args.slice(1).join(' ');
            } else if (option === '-a' || option === 'a' || option === 'audio' || option === 'music') {
                downloadType = 'audio';
                searchQuery = args.slice(1).join(' ');
            } else {
                searchQuery = args.join(' ');
            }

            if (!searchQuery) {
                return bot.sendMessage(msg.chat.id, 'Please provide a search query. Usage: /ytb [options] <title>', { replyToMessage: msg.message_id });
            }

            const downloadMsg = await bot.sendMessage(msg.chat.id, `⏳ Searching for the ${downloadType}...`, { replyToMessage: msg.message_id });

            let videoUrl;

            // Check if the input is a YouTube video URL
            if (ytdl.validateURL(searchQuery)) {
                videoUrl = searchQuery;
            } else {
                // If input is not a URL, search for videos using the input as a query
                const searchResults = await ytSearch(searchQuery);

                // Get the first video from the search results
                const firstVideo = searchResults.videos[0];
                if (!firstVideo) {
                    throw new Error('No videos found for the given query.');
                }

                // Construct the video URL from the video ID
                videoUrl = `https://www.youtube.com/watch?v=${firstVideo.videoId}`;
            }

            // Get video info
            const videoInfo = await ytdl.getInfo(videoUrl);
            const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
            const authorName = videoInfo.videoDetails.author.name;
            const viewCount = videoInfo.videoDetails.viewCount;

            // Create a temporary file path
            const filePath = path.join(__dirname, 'cache', `${videoTitle}.${downloadType === 'audio' ? 'mp3' : 'mp4'}`);

            // Ensure the cache directory exists
            fs.ensureDirSync(path.join(__dirname, 'cache'));

            // Download the video
            const videoStream = ytdl(videoUrl, { filter: downloadType === 'audio' ? 'audioonly' : 'videoandaudio', quality: 'highest' });
            const fileWriteStream = fs.createWriteStream(filePath);
            videoStream.pipe(fileWriteStream);

            videoStream.on('end', async () => {
                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

                if (fileSizeInBytes > 50 * 1024 * 1024) { // Telegram has a file size limit of 50MB
                    fs.unlinkSync(filePath);
                    return bot.sendMessage(msg.chat.id, '❌ The file could not be sent because it is larger than 50MB.', { replyToMessage: msg.message_id });
                }

                const caption = `<b>Title:</b> ${videoInfo.videoDetails.title}\n<b>Author:</b> ${authorName}\n<b>Views:</b> ${viewCount}\n<b>File Size:</b> ${fileSizeInMegabytes.toFixed(2)} MB`;

                if (downloadType === 'audio') {
                    await bot.sendAudio(msg.chat.id, fs.createReadStream(filePath), { caption, parseMode: 'HTML' });
                } else {
                    await bot.sendVideo(msg.chat.id, filePath, { caption, parseMode: 'HTML' }, { replyToMessage: msg.message_id });
                }

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
