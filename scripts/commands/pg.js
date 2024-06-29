const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

const nevPrompt = "";

async function generateWithPlayground(prompt, resolution) {
    const apiKey = "api1";
    const apiUrl = `https://for-devs.onrender.com/api/playgroundai?prompt=${encodeURIComponent(prompt)}&nevPrompt=${encodeURIComponent(nevPrompt)}&resolution=${encodeURIComponent(resolution)}&apikey=${encodeURIComponent(apiKey)}`;

    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(apiUrl, { method: 'GET', headers: { 'accept': 'application/json' } });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.imageUrl) {
                resolve({ images: [{ url: data.imageUrl }], modelUsed: "Playground" });
            } else {
                reject(new Error("No image URL found in the API response."));
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    config: {
        name: "playground",
        aliases: ["pg"],
        version: "1.0.2",
        author: "Samir Thakuri",
        role: 0,
        cooldown: 10,
        description: "generate images using playground v2.5",
        category: "image",
    },

    onStart: async function ({ bot, msg, args, chatId }) {
        const prompt = args.join(" ");

        if (!prompt) {
          await bot.sendMessage(chatId, 'Please provide prompt.', { replyToMessage: msg.message_id });
          return;
        }

        await bot.sendChatAction(msg.chat.id, "typing");
        const preMessage = await bot.sendMessage(chatId, "⏳ | Generating AI Image...", { replyToMessage: msg.message_id });

        try {
            const result = await generateWithPlayground(prompt, "Square");

            const imageUrl = result.images[0].url;

            await bot.sendPhoto(msg.chat.id, imageUrl, { caption: `Here is the image:\n\n${imageUrl}`}, { replyToMessage: msg.message_id });

            await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
        } catch (error) {
            console.error('Error:', error);
            await bot.sendMessage(msg.chat.id, `Error: ${error.message}`, { replyToMessage: msg.message_id });
        }
    }
};