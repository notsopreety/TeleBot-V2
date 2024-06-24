const axios = require('axios');

async function getTopTikWmResult(options) {
  const defaultOptions = {
    keywords: '',
    count: 1,  // We only need the top result
    hd: 1,
    region: 'ne'
  };

  const payload = { ...defaultOptions, ...options };

  try {
    const response = await axios.post('https://tikwm.com/api/feed/search', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    if (data.code !== 0 || !data.data.videos.length) {
      throw new Error(data.msg || 'No videos found');
    }

    const video = data.data.videos[0];

    return {
      region: video.region,
      title: video.title,
      duration: video.duration,
      play: video.play,
      music: video.music,
      play_count: video.play_count,
      digg_count: video.digg_count,
      comment_count: video.comment_count,
      share_count: video.share_count,
      download_count: video.download_count,
      author: {
        unique_id: video.author.unique_id,
        nickname: video.author.nickname,
      }
    };
  } catch (error) {
    console.error('Error fetching top TikTok search result:', error.message);
    throw error;
  }
}

module.exports = {
  config: {
    name: 'tiksr',
    aliases: ['tiksearch', 'tiktoksearch', 'tiktoksr'],
    role: 0, // Adjust role as needed
    cooldowns: 5,
    version: '1.2.0',
    author: 'Samir Thakuri',
    category: 'media',
    usage: 'tiktrend <region> (Default: NP)',
    description: 'Search TikTok trending videos based on keywords',
    usage: 'tiksr <keywords>'
  },

  onStart: async function({ bot, msg, args, chatId }) {
    const keywords = args.join(' ');

    if (!keywords) {
      await bot.sendMessage(chatId, 'Please provide keywords to search for TikTok videos.', { replyToMessage: msg.message_id });
      return;
    }

    const preMessage = await bot.sendMessage(chatId, `⏳ | Searching TikTok videos related to "${keywords}"...`, { replyToMessage: msg.message_id });

    try {
      const videoData = await getTopTikWmResult({ keywords });

      const caption = `
🌟 Top TikTok Search Result 🌟
🎬 Title: ${videoData.title}
🌍 Region: ${videoData.region}
⏱ Duration: ${videoData.duration} seconds
▶️ Play Count: ${videoData.play_count}
👍 Likes: ${videoData.digg_count}
💬 Comments: ${videoData.comment_count}
🔗 Shares: ${videoData.share_count}
📥 Downloads: ${videoData.download_count}
👤 Author: ${videoData.author.nickname} (@${videoData.author.unique_id})`;

    await bot.sendVideo(msg.chat.id, videoData.play, { caption, parseMode: 'HTML' }, { replyToMessage: msg.message_id }, { asReply: true });
    await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
    } catch (error) {
      console.error('Error in tiksearch command:', error);
      await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Error occurred while searching for TikTok videos.', { replyToMessage: msg.message_id });
    }
  },
};
