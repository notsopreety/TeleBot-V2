const axios = require('axios');

async function downloadFromTerabox(videoUrl) {
    const apiUrl = 'https://ytshorts.savetube.me/api/v1/terabox-downloader';
    const payload = {
        url: videoUrl
    };

    try {
        const response = await axios.post(apiUrl, payload);
        return response.data;
    } catch (error) {
        throw new Error('Error occurred:', error.message);
    }
}

module.exports = downloadFromTerabox;
