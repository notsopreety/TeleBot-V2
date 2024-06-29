const axios = require('axios');

module.exports = {
    config: {
        name: "hent",
        aliases: ["hentai", "hentaivideo"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "media",
        description: "Fetch and send a random Hen*ai.",
        usage: "hentai",
    },

    onStart: async function ({ bot, chatId, msg }) {
        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🎥 | Searching for a hen*ai...", { replyToMessage: msg.message_id });

        try {
            // Make a request to the video API
            const apiUrl = 'https://samirxpikachu.onrender.com/hentai';
            const response = await axios.get(apiUrl);

            if (response.status === 200 && response.data.length > 0) {
                // Filter videos of type 'video/mp4'
                const videos = response.data.filter(video => video.type === 'video/mp4');

                if (videos.length === 0) {
                    await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No MP4 videos found.', { replyToMessage: msg.message_id });
                    return;
                }

                // Select a random video from the filtered list
                const randomIndex = Math.floor(Math.random() * videos.length);
                const randomVideo = videos[randomIndex];

                // Prepare the caption
                const caption = `${randomVideo.title}\n\nCategory: ${randomVideo.category}\nShares: ${randomVideo.share_count}\nViews: ${randomVideo.views_count}`;

                // Send the random video using its URL and caption
                await bot.sendVideo(chatId, randomVideo.video_1, { caption });

                // Delete the pre-processing message after sending the video
                await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
            } else {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No videos found.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("Video API Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch video. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
