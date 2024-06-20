const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: 'tiktok',
        version: '1.0',
        author: 'kshitiz',
        role: 0,
        cooldowns: 5,
        version: '1.2.0',
        author: 'Samir Thakuri',
        category: "media",
        description: "Get random trending tiktok in Nepal.",
        usage: "tiktok",
    },

    onStart: async function({ bot, msg, chatId }) {

        const searchAndSendVideo = async (threadID) => {

            const options = {
                method: 'GET',
                url: 'https://tiktok-scraper7.p.rapidapi.com/feed/search',
                params: {
                    region: 'ne',
                    count: '1'
                },
                headers: {
                    'X-RapidAPI-Key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
                    'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
                },
            };

            try {
                const response = await axios.request(options);
                const videos = response.data.data.videos;

                if (!videos || videos.length === 0) {
                    await bot.sendMessage(chatId, `No TikTok videos found for the query: ${searchQuery}`, { replyToMessage: msg.message_id });
                } else {
                    const videoData = videos[0];
                    const videoUrl = videoData.play;
                    const message = `Random Tiktok video 🥱`;
                    const filePath = path.join(__dirname, `cache/tiktok_video_${threadID}.mp4`);
                    const writer = fs.createWriteStream(filePath);

                    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
                    videoResponse.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    await bot.sendVideo(chatId, fs.createReadStream(filePath), { caption: message });

                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error('Error:', error);
                await bot.sendMessage(chatId, 'An error occurred while processing the request.', { replyToMessage: msg.message_id });
            }
        };

        try {
            const threadID = msg.chat.id; // Assuming msg object contains chat.id for chat identifier
            await searchAndSendVideo(threadID);
        } catch (error) {
            console.error('Error:', error);
        }
    },
};
