const axios = require('axios');

module.exports = {
    config: {
        name: "wiki",
        aliases: ["wikipedia"],
        role: 0,
        cooldowns: 5,
        version: '1.2.0',
        author: 'Samir Thakuri',
        category: "information",
        description: "Get information about a topic from Wikipedia",
        usage: "wiki <query>",
    },

    onStart: async function ({ bot, chatId, args }) {
        try {
            // Check if a term is provided
            if (!args[0]) {
                bot.sendMessage(chatId, `⚠️ Please provide a term.\n💡 Usage: ${this.config.usage}`);
                return;
            }

            const query = args.join(' ');

            // Get information from Wikipedia
            const res = await getWiki(query);

            // Check if response is valid
            if (!res || !res.title) {
                throw new Error(`No information found for '${query}'`);
            }

            // Format and send the information
            const txtWiki = `
🔎 You searched for '${res.title}'\n\nDescription: ${res.description}\n\nInfo: ${res.extract}`;

            bot.sendMessage(chatId, txtWiki);
        } catch (err) {
            console.error('Error fetching or sending Wikipedia information:', err);
            bot.sendMessage(chatId, `Error: ${err.message}`);
        }
    }
};

async function getWiki(q) {
    try {
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching Wikipedia API: ${error.message}`);
    }
}
