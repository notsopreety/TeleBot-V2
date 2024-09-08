const FormData = require('form-data');

// Helper function to introduce a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Command Handler: gen
module.exports = {
    config: {
        name: "gen",
        aliases: ["generate"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.5.0',
        author: 'Samir Thakuri',
        category: "image",
        description: "Generate images using a prompt and fetch them using provided APIs.",
        usage: "gen <prompt>",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        if (args.length === 0) {
            return bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        const prompt = args.join(" ");

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🔍 | Generating images...", { replyToMessage: msg.message_id });

        try {
            // Step 1: Request UID with prompt
            const formData = new FormData();
            formData.append('prompt', prompt);

            const uidResponse = await fetch('https://photoeditor.ai/api/v1/generate-image/', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            if (!uidResponse.ok) {
                throw new Error(`Failed to get UID. Status: ${uidResponse.status}`);
            }

            const uidData = await uidResponse.json();
            const uid = uidData.uid;

            // Introduce a delay of 6 seconds to allow the API time to generate the images
            await delay(6000);

            // Step 2: Fetch Images
            const imageResponse = await fetch(`https://photoeditor.ai/api/v1/generate-image/${uid}/`);

            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch images. Status: ${imageResponse.status}`);
            }

            const imageData = await imageResponse.json();

            if (imageData.status === "succeeded" && imageData.urls.length > 0) {
                // Prepare an array of image objects for the album
                const images = imageData.urls.map(imageUrl => ({ type: 'photo', media: imageUrl }));

                // Send the album
                await bot.sendMediaGroup(chatId, images, { caption: `Generated images for prompt: "${prompt}"`, replyToMessage: msg.message_id });

                // Delete the pre-processing message after sending images
                await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
            } else {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'No images generated. Please try again later.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("Image Generation API Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to generate images. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
