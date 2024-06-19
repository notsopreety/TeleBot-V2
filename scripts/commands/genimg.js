const { Hercai } = require('hercai');

const herc = new Hercai();

module.exports = {
    config: {
        name: "genimg",
        aliases: ["imagine2", "t2i", "generatev2"],
        role: 0,
        cooldowns: 5,
        version: '1.2.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Generate an image based on a prompt",
        usage: "genimg <prompt> [model]\nAvailable Models:\nv1, c2, v2-beta, v3, lexica, prodia, simurg, animefy, raava, shonin.",
    },

    onStart: async function ({ bot, args, chatId, config, msg }) {
        // Check if a prompt is provided
        if (!args[0]) {
            bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${config.prefix}genimg <prompt> [model]\nAvailable Models:\nv1, c2, v2-beta, v3, lexica, prodia, simurg, animefy, raava, shonin.`, { replyToMessage: msg.message_id });
            return;
        }

        // Extract the prompt and optional model from arguments
        const [prompt, model] = args.join(" ").split("|").map(item => item.trim());

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "Generating image...", { replyToMessage: msg.message_id });

        try {
            // Generate an image using Hercai
            const response = await herc.drawImage({ model: model || "v3", prompt });

            // Send the generated image along with the response
            await bot.sendPhoto(chatId, response.url, { caption: `Here's Your Image!\nURD: ${response.url}\nPrompt: ${prompt}\nModel: ${model || "v3"}`}, { replyToMessage: msg.message_id });

            // Delete the pre-processing message
            await bot.deleteMessage(chatId, preMessage.message_id);
        } catch (error) {
            console.error("AI Error:", error);
            bot.sendMessage(chatId, "Failed to generate the image. Please try again later.", { replyToMessage: msg.message_id });
            // Delete the pre-processing message if an error occurs
            await bot.deleteMessage(chatId, preMessage.message_id);
        }
    }
}
