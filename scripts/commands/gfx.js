const axios = require('axios');
module.exports = {
    config: {
        name: 'gfx',
        aliases: ['gfx'], 
        category: 'gfx',
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Generate a GFX image with a given name',
        usage: '/gfx'
    },

    onStart: async function({ bot, args, chatId }) {
        // Check if a name is provided
        const name = args.join(" ");
        if (!name) {
            bot.sendMessage(chatId, "Please provide a name to generate a GFX image.");
            return;
        }
    
        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "Generating GFX image...");
    
        try {
            // Fetch GFX image from the API
            const apiUrl = `https://tanjiro-api.onrender.com/gfx2?name=${encodeURIComponent(name)}&api_key=tanjiro`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    
            // Convert the response to a Buffer
            const gfxBuffer = Buffer.from(response.data);
    
            // Send the GFX image as a photo along with a text message
            bot.sendPhoto(chatId, gfxBuffer, { caption: "Here's Your GFX IMG" });
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "An error occurred while generating the GFX image.");
        } finally {
            // Delete the pre-processing message
            bot.deleteMessage(chatId, preMessage.message_id);
        }
    }
};
