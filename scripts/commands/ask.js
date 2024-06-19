const { Hercai } = require('hercai');

const herc = new Hercai();

module.exports = {
    config: {
        name: "ask",
        aliases: ["herc", "hercai"],
        role: 0,
        cooldowns: 5,
        version: '1.2.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Interact with GPTs through HercAI library.",
        usage: "ask <question>",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
    // Check if a question is provided
    if (!args[0]) {
        bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        return;
    }

    const question = args.join(" ");

    // Send a pre-processing message
    const preMessage = await bot.sendMessage(chatId, "💭 | Thinking...", { replyToMessage: msg.message_id });

    try {
        // Ask a question using Hercai
        const response = await herc.question({ model: "v3", content: question });

        // Detect code format and include in a code block
        const formattedResponse = response.reply.match(/```(\w+)\n([\s\S]+)```/) ?
            response.reply : "Yukai says:\n```\n" + response.reply + "\n```";

        bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, formattedResponse, { replyToMessage: msg.message_id }, { parseMode: 'Markdown' });
    } catch (error) {
        console.error("Yukai Error:", error);
        bot.sendMessage(chatId, "Failed to process the question. Please try again later.");
    }
    }
}
