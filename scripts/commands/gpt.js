const axios = require('axios');

async function fetchChatGPTResponse(message) {
  const options = {
    method: 'POST',
    url: 'https://open-ai21.p.rapidapi.com/chatgpt',
    headers: {
      'x-rapidapi-key': 'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
      'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: message
        },
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        }
      ],
      web_access: false
    })
  };

  try {
    const response = await axios.request(options);
    return response.data.result; // Return the ChatGPT response
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
}

module.exports = {
  config: {
    name: 'gpt',
    aliases: ['openai', 'chatgpt'],
    category: 'ai',
    role: 0, // Adjust role as needed
    cooldowns: 5,
    version: '1.2.0',
    author: 'Samir Thakuri',
    category: "ai",
    description: "Interact with OpenAI ChatGPT 3.5.",
    usage: "gpt <query>",
  },

  onStart: async function({ bot, msg, args, chatId }) {
    if (!args[0]) {
      bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${this.config.usage}`, { asReply: true });
      return;
    }

    const question = args.join(" ");

    const preMessage = await bot.sendMessage(chatId, "⏳ | Responding...", { replyToMessage: msg.message_id });
    
    try {
      const response = await fetchChatGPTResponse(question);

      const formattedResponse = response.match(/```(\w+)\n([\s\S]+)```/) ?
        response : "GPT Response:\n```\n" + response + "\n```";

      // Send the ChatGPT response back to the chat
      bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, formattedResponse, { replyToMessage: msg.message_id }, { parseMode: 'Markdown' });
    } catch (error) {
      console.error('Error in gpt command:', error);
      await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Error occurred while fetching ChatGPT response.', { replyToMessage: msg.message_id });
    }
  },
};
