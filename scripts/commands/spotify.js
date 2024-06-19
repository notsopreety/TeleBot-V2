const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'spotify',
        aliases: ['spot'],
        category: 'media',
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Download audio from Spotify',
        usage: 'spotify <songname or url>'
    },

    onStart: async function({ msg, bot, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, 'No search query or URL provided. Usage: /spotify <songname or url>', { replyToMessage: msg.message_id });
            }

            const queryOrUrl = args.join(' ');

            let songUrl;
            let songMetadata;
            let downloadLink;

            if (queryOrUrl.includes('open.spotify.com/track/')) {
                // If the input is a Spotify track URL, use the download API directly
                songUrl = queryOrUrl;
            } else {
                // If the input is a song name, use the search API
                const searchResponse = await axios.get(`https://milanbhandari.onrender.com/spotisearch?query=${encodeURIComponent(queryOrUrl)}`);
                const searchResults = searchResponse.data;

                if (!searchResults.length) {
                    throw new Error('No songs found for the given query.');
                }

                // Use the first search result
                songUrl = searchResults[0].link;
            }

            // Use the download API to get the download link and metadata
            const downloadResponse = await axios.get(`https://milanbhandari.onrender.com/spotify?url=${encodeURIComponent(songUrl)}`);
            const downloadData = downloadResponse.data;

            if (!downloadData.success) {
                throw new Error('Failed to download the song.');
            }

            downloadLink = downloadData.link;
            songMetadata = downloadData.metadata;

            const downloadMsg = await bot.sendMessage(msg.chat.id, `⏳ Downloading ${songMetadata.title} by ${songMetadata.artists}...`, { replyToMessage: msg.message_id });

            // Create a temporary file path
            const filePath = path.join(__dirname, 'cache', `${songMetadata.title.replace(/[^\w\s]/gi, '')}.mp3`);
            fs.ensureDirSync(path.join(__dirname, 'cache'));

            // Download the audio file
            const response = await axios({
                method: 'GET',
                url: downloadLink,
                responseType: 'stream'
            });

            const fileWriteStream = fs.createWriteStream(filePath);
            response.data.pipe(fileWriteStream);

            fileWriteStream.on('finish', async () => {
                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);

                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

                if (fileSizeInBytes > 50 * 1024 * 1024) { // Telegram has a file size limit of 50MB
                    fs.unlinkSync(filePath);
                    return bot.sendMessage(msg.chat.id, '❌ The file could not be sent because it is larger than 50MB.', { replyToMessage: msg.message_id });
                }

                const caption = `<b>Title:</b> ${songMetadata.title}\n<b>Artist:</b> ${songMetadata.artists}\n<b>Album:</b> ${songMetadata.album}\n<b>Release Date:</b> ${songMetadata.releaseDate}\n<b>File Size:</b> ${fileSizeInMegabytes.toFixed(2)} MB`;

                await bot.sendAudio(msg.chat.id, fs.createReadStream(filePath), { caption, parseMode: 'HTML' });

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
