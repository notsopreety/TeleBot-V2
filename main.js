const TeleBot = require('telebot');
const config = require('./config.json');
const connectDB = require('./database/connectDB');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const axios = require('axios');

const bot = new TeleBot(config.botToken);

// Connect to MongoDB
connectDB(config.mongoURI).then(async ({ threadModel, userModel }) => {
    console.log('MongoDB connected');

    // Load commands and events
    const commands = new Map();
    const aliases = new Map();
    const loadCommands = (dir) => {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            const fileExtension = path.extname(file);
            if (fs.statSync(filePath).isDirectory()) {
                loadCommands(filePath);
            } else if (fileExtension === '.js') {
                const command = require(filePath);
                if (command.config) {
                    commands.set(command.config.name.toLowerCase(), command);
                    if (command.config.aliases) {
                        command.config.aliases.forEach(alias => aliases.set(alias.toLowerCase(), command.config.name.toLowerCase()));
                    }
                }
            }
        });
    };
    loadCommands(path.join(__dirname, 'scripts/commands'));
    
    // Function to load and execute events
    const loadEvents = async (bot, threadModel, userModel) => {
        const eventsDir = path.join(__dirname, 'scripts', 'events');

        fs.readdirSync(eventsDir).forEach(file => {
            if (path.extname(file) === '.js') {
                const event = require(path.join(eventsDir, file));

                if (event.config && event.onEvent) {
                    bot.on(event.config.name, (msg) => event.onEvent({ bot, threadModel, userModel, msg, config }));
                }
            }
        });

        console.log('Events loaded and bound successfully.');
    };
    loadEvents(bot, threadModel, userModel);
    

    // Function to check if user is an admin
    const isAdmin = (userId, chatAdmins) => {
        return config.adminId.includes(userId.toString()) || chatAdmins.some(admin => admin.user.id === userId);
    };

    // Function to check if user is globally banned
    const isGloballyBanned = async (userId) => {
        try {
            const response = await axios.get('https://raw.githubusercontent.com/notsopreety/Uselessrepo/main/gban.json');
            const bannedUsers = response.data;
            const bannedUser = bannedUsers.find(user => user.userId === userId);
            return bannedUser ? bannedUser : null;
        } catch (error) {
            console.error('Error fetching global ban list:', error);
            return null;
        }
    };
    
    const cooldowns = new Map();

    // Check if user has necessary permissions to execute a command
    const hasPermission = (userId, chatAdmins, config) => {
        if (config.onlyAdmin) {
            // If onlyAdmin is true, only bot admin can use the bot
            return config.adminId.includes(userId.toString());
        } else {
            // If onlyAdmin is false, check if user is chat admin or bot admin
            return isAdmin(userId, chatAdmins) || config.adminId.includes(userId.toString());
        }
    };

    bot.on('text', async (msg) => {
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();
        const chatAdmins = msg.chat.type === 'group' || msg.chat.type === 'supergroup' ? await bot.getChatAdministrators(chatId) : [];
        const userIsAdmin = isAdmin(userId, chatAdmins);
        const botName = config.botName;
        const username = msg.from.username;
        const first_name = msg.from.first_name;
        const last_name = msg.from.last_name;
        const senderName = `${first_name} ${last_name}`;

        // Check if user is an admin and only admin mode is enabled
        if (config.onlyAdmin && !config.adminId.includes(userId.toString())) {
            return bot.sendMessage(chatId, '(Only Admin Mode) Bot is under maintenance.');
        }

        // Find or create thread in database
        let thread = await threadModel.findOne({ chatId });
        if (!thread) {
            thread = new threadModel({ chatId });
            await thread.save();
            console.log(`[DATABASE] New thread: ${chatId} database has been created!`);
        }

        // Find or create user in database
        let user = await userModel.findOne({ userID: userId });
        if (!user) {
            user = new userModel({
                userID: userId,
                username: msg.from.username,
                first_name: msg.from.first_name,
                last_name: msg.from.last_name
            });
            await user.save();
            console.log(`[DATABASE] New user: ${userId} database has been created!`);
        }

        // Increment user's message count in the thread (if it's not a command)
        if (!msg.text.startsWith(config.prefix)) {
            if (!thread.users) {
                thread.users = new Map();
            }

            if (!thread.users.has(userId)) {
                thread.users.set(userId, { totalMsg: 1 });
            } else {
                thread.users.get(userId).totalMsg += 1;
            }
            await thread.save();
        }

        // Handle command processing (if message starts with the configured prefix)
        if (msg.text.startsWith(config.prefix)) {
            const args = msg.text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName) || commands.get(aliases.get(commandName));

            if (!command) {
                return bot.sendMessage(chatId, 'Invalid command.');
            }

            const { role, cooldown } = command.config;

            // Role validation
            if ((role === 1 && !userIsAdmin) || (role === 2 && !config.adminId.includes(userId))) {
                return bot.sendMessage(chatId, 'You do not have permission to use this command.');
            }

            // Cooldown check
            if (!cooldowns.has(commandName)) {
                cooldowns.set(commandName, new Map());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(commandName);
            const cooldownAmount = (cooldown || 3) * 1000; // Default cooldown of 3 seconds

            if (timestamps.has(userId)) {
                const expirationTime = timestamps.get(userId) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return bot.sendMessage(chatId, `Please wait ${timeLeft.toFixed(1)} more seconds before reusing the ${commandName} command.`, { replyToMessage: msg.message_id });
                }
            }

            timestamps.set(userId, now);
            setTimeout(() => timestamps.delete(userId), cooldownAmount);

            // Execute command
            try {
                await command.onStart({ msg, bot, args, chatId, userId, config, botName, senderName, username });
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                bot.sendMessage(chatId, 'There was an error executing the command.');
            }
        }
    });



    // Start the bot
    bot.start();
    console.log('Bot started');
}).catch(error => {
    console.error('Error connecting to MongoDB', error);
});

const http = require('http');
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(`
        <html>
            <head>
                <title>Active</title>
            </head>
            <body style="margin: 0; padding: 0;">
                <iframe width="100%" height="100%" src="https://apibysamir.onrender.com/" frameborder="0" allowfullscreen></iframe>
            </body>
        </html>`);
});
const port = config.port || 3000;
server.listen(port, () => {
    console.log(`Server online at port: ${port}`);
});