const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'football',
        aliases: ['footballupdates'],
        category: 'information',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Get latest football updates',
        usage: 'football'
    },

    onStart: async function({ bot, msg, chatId}) {
        try {
            const response = await axios.get('https://free-football-soccer-videos.p.rapidapi.com/', {
                headers: {
                    'X-RapidAPI-Key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
                    'X-RapidAPI-Host': 'free-football-soccer-videos.p.rapidapi.com'
                }
            });

            const randomVideoIndex = Math.floor(Math.random() * response.data.length);
            const randomVideo = response.data[randomVideoIndex];

            const title = randomVideo.title;
            const thumbnail = randomVideo.thumbnail;
            const videoUrl = randomVideo.url;

            // Download thumbnail to cache directory
            const cacheDirectory = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDirectory)) {
                fs.mkdirSync(cacheDirectory, { recursive: true });
            }
            const cacheFilePath = path.join(cacheDirectory, 'thumbnailCache.jpg');

            const thumbnailResponse = await axios.get(thumbnail, { responseType: 'stream' });
            const thumbnailWriteStream = fs.createWriteStream(cacheFilePath);
            thumbnailResponse.data.pipe(thumbnailWriteStream);

            await new Promise((resolve, reject) => {
                thumbnailWriteStream.on('finish', resolve);
                thumbnailWriteStream.on('error', reject);
            });

            const message = `𝗧𝗜𝗧𝗜𝗟𝗘 : ${title}\n│ 𝗗𝗘𝗧𝗔𝗜𝗟𝗦&𝗩𝗗𝗢_𝗨𝗥𝗟: ${videoUrl}`;

            // Send message with attachment (thumbnail)
            await bot.sendPhoto(msg.chat.id, fs.createReadStream(cacheFilePath), { caption: message });

            // Clean up: Delete cached thumbnail file
            fs.unlinkSync(cacheFilePath);

        } catch (error) {
            console.error('Error in football command:', error);
            await bot.sendMessage(msg.chat.id, 'Error occurred while fetching football updates.', { replyToMessage: msg.message_id });
        }
    }
};