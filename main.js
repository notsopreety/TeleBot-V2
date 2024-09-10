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
        return chatAdmins.some(admin => admin.user.id === userId);
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
    const hasPermission = async (userId, chatId, commandConfig) => {
        const chatAdmins = chatId ? await bot.getChatAdministrators(chatId) : [];
        if (commandConfig.onlyAdmin) {
            // If onlyAdmin is true, only bot admin can use the bot
            return config.adminId.includes(userId.toString());
        } else {
            const userIsAdmin = isAdmin(userId, chatAdmins);
            if (commandConfig.role === 1) {
                return userIsAdmin;
            }
            // For other roles, fallback to bot admin check
            return config.adminId.includes(userId.toString());
        }
    };

    bot.on('text', async (msg) => {
        const chatId = msg.chat.id.toString();
        const userId = msg.from.id.toString();
        
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

        // Check if user is globally banned
        const globalBanInfo = await isGloballyBanned(userId);
        if (globalBanInfo) {
            const banTime = moment(globalBanInfo.banTime).format('MMMM Do YYYY, h:mm:ss A');
            if (msg.text.startsWith(config.prefix)) {
                return bot.sendPhoto(chatId, globalBanInfo.proof, { caption: `Dear @${msg.from.username} !\nYou are globally banned from using ${config.botName}\nReason: ${globalBanInfo.reason}\nBan Time: ${banTime}` }, { replyToMessage: msg.message_id });
            }
            return; // Exit if user is globally banned
        }

        // Check if user is banned locally
        if (user.banned) {
            if (msg.text.startsWith(config.prefix)) {
                return bot.sendMessage(chatId, 'You are banned from using this bot!', { replyToMessage: msg.message_id });
            }
            return; // Exit if user is locally banned
        }

        // Check if user is banned in the specific group or chat (gcBan)
        if (thread.users && thread.users.has(userId)) {
            const userInThread = thread.users.get(userId);
            if (userInThread.gcBan) {
                if (msg.text.startsWith(config.prefix)) {
                    return bot.sendMessage(chatId, 'You are banned from using this bot in this group!', { replyToMessage: msg.message_id });
                }
                return; // Exit if user is gcBanned
            }
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
                return bot.sendMessage(chatId, 'Invalid command.', { replyToMessage: msg.message_id });
            }
        
            const { role, cooldown } = command.config;

            // Role validation
            if (!(await hasPermission(userId, chatId, command.config))) {
                return bot.sendMessage(chatId, 'You do not have permission to use this command.', { replyToMessage: msg.message_id });
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
                await command.onStart({ msg, bot, args, chatId, userId, config, botName: config.botName, senderName: `${msg.from.first_name} ${msg.from.last_name}`, username: msg.from.username, copyrightMark: config.copyrightMark, threadModel, userModel, user, thread, api: config.globalapi });
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
