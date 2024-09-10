const axios = require('axios'); // Ensure axios is installed and required

// Define command prefixes as constants
const PREFIXES = [
    'neko',
    'ai'
];

module.exports = {
    config: {
        name: 'text',
        description: 'A command that responds to specific questions using AI.',
        aliases: []  // No aliases required
    },
    onEvent: async ({ bot, msg, threadModel, userModel }) => {
        const chatId = msg.chat.id;
        const text = msg.text.toLowerCase();  // Convert text to lowercase
        const userId = msg.from.id;

        // Check if the message starts with any command prefix
        for (const prefix of PREFIXES) {
            if (text.startsWith(prefix.toLowerCase())) {
                const question = text.slice(prefix.length).trim();
                
                if (!question) {
                    await bot.sendMessage(chatId, "Please provide a question.", { replyToMessage: msg.message_id });
                    return;
                }

                // Send initial thinking message
                const preMessage = await bot.sendMessage(chatId, "💭 | Thinking...", { replyToMessage: msg.message_id });
                
                try {
                    // Fetch AI-powered response
                    const response = await axios.get('https://anydl.guruapi.tech/ai/gpt4', {
                        params: {
                            query: question,
                            username: userId
                        }
                    });

                    // Extract the message from the API response
                    const aiMessage = response.data.msg || 'No response from AI.';

                    // Edit the thinking message with AI response
                    await bot.editMessageText(
                        { chatId: chatId, messageId: preMessage.message_id },
                        aiMessage,
                        { replyToMessage: msg.message_id },
                        { parseMode: 'Markdown' }
                    );
                } catch (error) {
                    console.error('Error fetching AI response:', error);
                    
                    // Edit the thinking message with an error message
                    await bot.editMessageText(
                        { chatId: chatId, messageId: preMessage.message_id },
                        'Failed to process the question. Please try again later.',
                        { replyToMessage: msg.message_id }
                    );
                }
                return;  // Exit the loop once a match is found
            }
        }
    }
};
