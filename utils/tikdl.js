const axios = require('axios');
const cheerio = require('cheerio');


async function fetchTikTokDataAlt(url) {
  try {
      // Make a POST request to the API endpoint with the provided TikTok URL
      const payload = {
          query: url,
          language_id: "1"
      };
      const response = await axios.post('https://ttsave.app/download', payload);

      // Load the HTML response into Cheerio
      const $ = cheerio.load(response.data);

      // Extract relevant data from HTML elements
      const usernameElement = $('a.font-extrabold.text-blue-400.text-xl.mb-2');
      const username = usernameElement.text().trim();
      const title = usernameElement.attr('title');
      const profilePictureUrl = $('img').eq(0).attr('src');
      const tiktokUrl = $('a.font-extrabold.text-blue-400.text-xl.mb-2').attr('href');
      const caption = $('p.text-gray-600').text().trim();
      const viewCount = $('div.flex.flex-row.items-center.justify-center span.text-gray-500').eq(0).text().trim();
      const likeCount = $('div.flex.flex-row.items-center.justify-center span.text-gray-500').eq(1).text().trim();
      const commentCount = $('div.flex.flex-row.items-center.justify-center span.text-gray-500').eq(2).text().trim();
      const shareCount = $('div.flex.flex-row.items-center.justify-center span.text-gray-500').eq(3).text().trim();
      const downloadWithoutWatermarkUrl = $('a[type="no-watermark"]').attr('href');
      const downloadWithWatermarkUrl = $('a[type="watermark"]').attr('href');

      // Structure the extracted data into an object
      const tiktokData = {
          username,
          title,
          profilePictureUrl,
          tiktokUrl,
          caption,
          viewCount,
          likeCount,
          commentCount,
          shareCount,
          downloadWithoutWatermarkUrl,
          downloadWithWatermarkUrl
      };

      // Return the structured data
      return tiktokData;
  } catch (error) {
      // Throw error if any occurs during the process
      throw error;
  }
}

// Example usage with user input
// const tiktokUrl = "https://vt.tiktok.com/ZSYkap7E3/";
// fetchTikTokDataAlt(tiktokUrl)
    // .then(data => console.log(data))
//     .catch(error => console.error(error));

module.exports = fetchTikTokDataAlt;

