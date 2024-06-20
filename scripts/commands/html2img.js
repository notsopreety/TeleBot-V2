const axios = require('axios');

async function generateImageFromHtml(htmlContent) {
  const options = {
    method: 'POST',
    url: 'https://html-css-to-image4.p.rapidapi.com/image',
    headers: {
      'x-rapidapi-key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
      'x-rapidapi-host': 'html-css-to-image4.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      html: htmlContent,
      ms_delay: 250,
      selector: '.container',
      format: 'png',
      device_scale: 1
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.url; // Return the URL of the generated image
  } catch (error) {
    console.error('Error generating image from HTML:', error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
}

module.exports = {
  config: {
    name: 'html2img',
    description: 'Convert HTML content into an image',
    usage: '/html2img <HTML content>',
    category: 'utility',
    role: 0, // Adjust role as needed
  },

  onStart: async function({ bot, msg, args }) {
    try {
      const htmlContent = args.join(' '); // Combine all arguments to form HTML content

      if (!htmlContent) {
        await bot.sendMessage(msg.chat.id, 'Please provide HTML content to convert into an image.', { replyToMessage: msg.message_id });
        return;
      }

      const imageUrl = await generateImageFromHtml(htmlContent);

      // Send the generated image URL as a message
      await bot.sendMessage(msg.chat.id, `Image generated: ${imageUrl}`);

    } catch (error) {
      console.error('Error in html2img command:', error);
      await bot.sendMessage(msg.chat.id, 'Error occurred while generating image from HTML.', { replyToMessage: msg.message_id });
    }
  },
};
