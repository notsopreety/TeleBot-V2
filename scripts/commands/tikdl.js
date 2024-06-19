const fetchTikTokDataAlt = require("../../utils/tikdl");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
    config: {
        name: "tikdl",
        aliases: ["ttdl", "tikdl", "tiktok", "tt", "tiktokdl",  "tiktoknowm", "tiktokwm", "ttwm", "ttnowm"],
        category: "downloader",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Download TikTok video without watermark",
        usage: "tikdl <video_url>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, "No URL provided", { replyToMessage: msg.message_id });
            }

            await bot.sendMessage(msg.chat.id, '⏳ Downloading TikTok Video...', { replyToMessage: msg.message_id });

            const url = args[0];
            const tiktokData = await fetchTikTokDataAlt(url);

            if (tiktokData.downloadWithoutWatermarkUrl) {
                // Construct message with additional details
                const message = `Username: ${tiktokData.username}\nCaption: ${tiktokData.caption}\nViews: ${tiktokData.viewCount}\nLikes: ${tiktokData.likeCount}\nComments: ${tiktokData.commentCount}\nShares: ${tiktokData.shareCount}`;

                // Download the video locally
                const videoPath = path.join(__dirname, 'cache', `${tiktokData.username}.mp4`);
                const videoWriter = fs.createWriteStream(videoPath);
                const videoResponse = await axios.get(tiktokData.downloadWithoutWatermarkUrl, { responseType: 'stream' });
                videoResponse.data.pipe(videoWriter);

                videoWriter.on('finish', async () => {
                    // Send the message and video URL to the user
                    await bot.sendVideo(msg.chat.id, videoPath, { caption: message }, { replyToMessage: msg.message_id });

                    // Delete the video file
                    fs.unlinkSync(videoPath);
                });

                videoWriter.on('error', async (err) => {
                    console.error('Error saving TikTok video:', err);
                    await bot.sendMessage(msg.chat.id, 'Error saving TikTok video', { replyToMessage: msg.message_id });
                });
            } else {
                await bot.sendMessage(msg.chat.id, 'No video found! Something went wrong.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error fetching or sending TikTok video:', error);
            await bot.sendMessage(msg.chat.id, 'Error fetching or sending TikTok video', { replyToMessage: msg.message_id });
        }
    },
};
