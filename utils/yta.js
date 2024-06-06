const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

// Function to search for YouTube videos and return the top audio with detailed info
async function getTopAudio(input) {
    try {
        let videoUrl;

        // Check if the input is a YouTube video URL
        if (ytdl.validateURL(input)) {
            videoUrl = input;
        } else {
            // If input is not a URL, search for videos using the input as a query
            const searchResults = await ytSearch(input);

            // Get the first video from the search results
            const firstVideo = searchResults.videos[0];
            if (!firstVideo) {
                throw new Error('No videos found for the given query.');
            }

            // Construct the video URL from the video ID
            videoUrl = `https://www.youtube.com/watch?v=${firstVideo.videoId}`;
        }

        // Get the audio info for the video
        const audioInfo = await ytdl.getInfo(videoUrl);

        // Get the highest quality audio format available
        const audioFormats = ytdl.filterFormats(audioInfo.formats, 'audioonly');
        const highestQualityAudio = audioFormats.find(format => format.audioBitrate);

        if (!highestQualityAudio) {
            throw new Error('No audio available for the given video.');
        }

        // Convert video duration from ISO 8601 format to milliseconds
        const durationISO = audioInfo.videoDetails.lengthSeconds;
        const durationMS = durationISO * 1000;

        return {
            title: audioInfo.videoDetails.title,
            url: highestQualityAudio.url,
            duration: durationMS
        };
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// // Example usage:
// const userInput = 'hawa le'; // YouTube video URL or search query
// getTopAudio(userInput)
//     .then(audio => {
//         if (audio) {
//             console.log('Top audio:', audio);
//         } else {
//             console.log('Failed to retrieve top audio.');
//         }
//     })
//     .catch(err => {
//         console.error('Error:', err);
//     });

module.exports = { getTopAudio };