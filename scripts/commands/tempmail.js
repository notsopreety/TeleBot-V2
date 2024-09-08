const axios = require('axios');

const BASE_URL = 'https://www.1secmail.com/api/v1/';
const USER_EMAILS = {}; // In-memory store for user emails

module.exports = {
    config: {
        name: "tempmail",
        aliases: ["tempemail"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "utility",
        description: "Manage temporary emails: generate, check inbox, list domains, create named email, and dispose.",
        usage: "tempmail <command> [args]",
    },

    onStart: async function ({ bot, msg, args }) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (args.length === 0) {
            return bot.sendMessage(chatId, "📬 **Usage:** /tempmail `<command>` [args]\n\n**Available commands:**\n" +
                "🆕 `/tempmail generate` - Generate a random temporary email.\n" +
                "📥 `/tempmail check` - Check the inbox of your generated email.\n" +
                "🌐 `/tempmail domains` - List all available email domains.\n" +
                "✉️ `/tempmail create <email>` - Create a custom temporary email in the format `name@domain.com`.\n" +
                "🗑️ `/tempmail dispose` - Dispose of your temporary email.\n", { replyToMessage: msg.message_id, parseMode: 'Markdown' });
        }

        const command = args[0].toLowerCase();

        try {
            if (command === 'generate') {
                const { data: emails } = await axios.get(`${BASE_URL}?action=genRandomMailbox&count=10`);
                if (!emails || emails.length === 0) {
                    throw new Error('Failed to generate emails.');
                }
                const selectedEmail = emails[0];
                USER_EMAILS[userId] = selectedEmail;

                const [login, domain] = selectedEmail.split('@');
                const { data: messages } = await axios.get(`${BASE_URL}?action=getMessages&login=${login}&domain=${domain}`);
                const latestMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;

                const messageDetails = latestMessage ? `
📩 **Latest Email Details:**
**From:** ${latestMessage.from || "Unknown Sender"}
**Subject:** ${latestMessage.subject || "No Subject"}
**Date:** ${latestMessage.date || "No Date"}
                ` : "**No messages received yet.**";

                bot.sendMessage(chatId, `🆕 **Your temporary email address is:**\n` +
                    `\n${selectedEmail}\n` +
                    `${messageDetails}`, { replyToMessage: msg.message_id, parseMode: 'Markdown' });

            } else if (command === 'check') {
                const email = USER_EMAILS[userId];
                if (!email) {
                    return bot.sendMessage(chatId, "🚨 **No email address found.** Please generate or create an email first using `/tempmail generate` or `/tempmail create <email>`.", { replyToMessage: msg.message_id, parseMode: 'Markdown' });
                }
                const [login, domain] = email.split('@');
                const { data: messages } = await axios.get(`${BASE_URL}?action=getMessages&login=${login}&domain=${domain}`);
                if (!messages || messages.length === 0) {
                    return bot.sendMessage(chatId, `📭 **No emails received yet for ${email}.**`, { replyToMessage: msg.message_id, parseMode: 'Markdown' });
                }
                const latestMessage = messages[messages.length - 1];
                const { data: messageDetails } = await axios.get(`${BASE_URL}?action=readMessage&login=${login}&domain=${domain}&id=${latestMessage.id}`);
                if (!messageDetails) {
                    throw new Error('Failed to fetch message details.');
                }
                const emailDetails = `
📬 **Checking Email:** ${email}
**From:** ${messageDetails.from || "Unknown Sender"}
**Subject:** ${messageDetails.subject || "No Subject"}
**Date:** ${messageDetails.date || "No Date"}
**Body:**
${messageDetails.textBody || "No Body"}
                `;
                bot.sendMessage(chatId, emailDetails, { replyToMessage: msg.message_id, parseMode: 'Markdown' });

            } else if (command === 'domains') {
                const { data: domains } = await axios.get(`${BASE_URL}?action=getDomainList`);
                if (!domains || domains.length === 0) {
                    throw new Error('Failed to fetch domain list.');
                }
                bot.sendMessage(chatId, `🌐 **Available Email Domains:**\n` +
                    `${domains.map(domain => `- ${domain}`).join('\n')}`, { replyToMessage: msg.message_id, parseMode: 'Markdown' });

            } else if (command === 'create') {
                const email = args[1];
                if (!email || !email.includes('@')) {
                    return bot.sendMessage(chatId, "⚠️ **Please provide a valid email address in the format `name@domain.com`.**", { replyToMessage: msg.message_id, parseMode: 'Markdown' });
                }
                USER_EMAILS[userId] = email;
                bot.sendMessage(chatId, `✉️ **Your created email address is:**\n` +
                    `\n${email}`, { replyToMessage: msg.message_id, parseMode: 'Markdown' });

            } else if (command === 'dispose') {
                if (!USER_EMAILS[userId]) {
                    return bot.sendMessage(chatId, "🚨 **No email address found.** Please generate or create an email first using `/tempmail generate` or `/tempmail create <email>`.", { replyToMessage: msg.message_id, parseMode: 'Markdown' });
                }
                delete USER_EMAILS[userId];
                bot.sendMessage(chatId, "🗑️ **Your temporary email address has been disposed of.**", { replyToMessage: msg.message_id, parseMode: 'Markdown' });

            } else {
                bot.sendMessage(chatId, "❓ **Unknown command.** Usage: `/tempmail <command> [args]`", { replyToMessage: msg.message_id, parseMode: 'Markdown' });
            }
        } catch (error) {
            console.error('Error in tempmail command:', error);
            bot.sendMessage(chatId, `⚠️ **An error occurred:** ${error.message}`, { replyToMessage: msg.message_id, parseMode: 'Markdown' });
        }
    },
};
