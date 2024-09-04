const path = require('path');
const fs = require('fs');
const { randomInt } = require('crypto'); // For generating random index

const quizDataPath = path.join(__dirname, 'json'); // Adjust path as needed

// Function to get a random question from JSON files
const getRandomQuestion = async () => {
    const allFiles = fs.readdirSync(quizDataPath).filter(file => file.endsWith('.json'));

    if (allFiles.length === 0) {
        console.error('No quiz data found.');
        return null;
    }

    const randomFile = allFiles[randomInt(allFiles.length)];
    const filePath = path.join(quizDataPath, randomFile);

    try {
        const data = JSON.parse(fs.readFileSync(filePath));
        const randomQuestion = data[randomInt(data.length)];
        return randomQuestion;
    } catch (error) {
        console.error(`Error reading quiz data from ${filePath}:`, error.message);
        return null;
    }
};

// Store the callback queries to handle responses uniquely
const activeQuizzes = new Map();

module.exports = {
    config: {
        name: 'quiz',
        aliases: [],
        category: 'games',
        role: 0, // Adjust role as needed
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: 'Play a quiz game',
        usage: 'quiz'
    },

    onStart: async function({ msg, bot, args, userId, config }) {
        const chatId = msg.chat.id;
        const questionData = await getRandomQuestion();

        if (!questionData) {
            try {
                await bot.sendMessage(chatId, 'Failed to load a quiz question. Please try again later.');
            } catch (error) {
                console.error('Error sending message:', error.message);
            }
            return;
        }

        // Clean up old quiz data
        if (activeQuizzes.has(chatId)) {
            clearTimeout(activeQuizzes.get(chatId).timeout);
        }

        const options = [
            { text: 'A', callback_data: questionData.answer === 'A' ? 'correct' : 'incorrect' },
            { text: 'B', callback_data: questionData.answer === 'B' ? 'correct' : 'incorrect' },
            { text: 'C', callback_data: questionData.answer === 'C' ? 'correct' : 'incorrect' },
            { text: 'D', callback_data: questionData.answer === 'D' ? 'correct' : 'incorrect' }
        ];

        const inlineKeyboard = bot.inlineKeyboard([options]);

        try {
            const messageText = `${questionData.question}\n\n[A]. ${questionData.A}\n[B]. ${questionData.B}\n[C]. ${questionData.C}\n[D]. ${questionData.D}`;
            const message = await bot.sendMessage(chatId, messageText, { replyMarkup: inlineKeyboard });

            // Store the callback handler and a timeout to clear old data
            const handleCallbackQuery = async (callbackQuery) => {
                if (callbackQuery.message.chat.id !== chatId) return;

                const correct = callbackQuery.data === 'correct';
                const responseText = correct
                    ? `Congratulations ${msg.from.first_name}! Your answer is correct.`
                    : `Sorry ${msg.from.first_name}, Incorrect! The correct answer is ${questionData.answer}.`;

                try {
                    await bot.sendMessage(callbackQuery.message.chat.id, responseText);
                    await bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id);
                } catch (error) {
                    console.error('Error handling user response:', error.message);
                }
            };

            // Store the handler and set a timeout to remove it after a certain period
            activeQuizzes.set(chatId, {
                handler: handleCallbackQuery,
                timeout: setTimeout(() => {
                    bot.removeListener('callbackQuery', handleCallbackQuery);
                    activeQuizzes.delete(chatId);
                }, 60000) // Timeout after 1 minute
            });

            bot.on('callbackQuery', handleCallbackQuery);
        } catch (error) {
            console.error('Error sending question:', error.message);
        }
    }
};
