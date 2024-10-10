const { spawn } = require('child_process');
const path = require('path');

module.exports = {
    config: {
        name: 'shell',
        aliases: ['shellcmd'],
        category: 'admin',
        role: 2,
        cooldowns: 0,
        version: '1.3.0',
        author: 'Samir Thakuri',
        description: 'Execute shell commands in a persistent session with realistic shell experience',
        usage: 'shell <cmd>'
    },

    // Create a single persistent shell process for the bot session
    shellSession: null,
    initialDir: path.resolve(process.cwd()), // Set initial directory to the main project directory

    onStart: async function({ bot, args, chatId, userId, msg }) {
        const owner = '5947023314'; // Replace with your Telegram user ID
        if (userId.toString() !== owner) {
            return bot.sendMessage(chatId, 'You do not have permission to use this command.', { replyToMessage: msg.message_id });
        }

        const command = args.join(" ");
        if (!command) {
            bot.sendMessage(chatId, "Please provide a command to execute.", { replyToMessage: msg.message_id });
            return;
        }

        // Initialize the shell session if it doesn't already exist
        if (!this.shellSession) {
            this.shellSession = spawn('bash', [], { cwd: this.initialDir, shell: true });

            // Set up listener for real-time output
            this.shellSession.stdout.on('data', async (data) => {
                const output = data.toString().trim();
                console.log(output); // Log output to machine terminal
                await bot.sendMessage(chatId, `\`${output}\``, { replyToMessage: msg.message_id, parseMode: 'Markdown' });
            });

            this.shellSession.stderr.on('data', async (data) => {
                const errorOutput = `Error: ${data.toString().trim()}`;
                console.error(errorOutput); // Log error output to machine terminal
                await bot.sendMessage(chatId, `\`${errorOutput}\``, { replyToMessage: msg.message_id, parseMode: 'Markdown' });
            });

            this.shellSession.on('close', (code) => {
                console.log(`Shell session closed with code ${code}`);
                this.shellSession = null; // Reset shell session if it closes
            });
        }

        // Modify the command to prevent leaving the initial directory
        const safeCommand = command === 'cd' || command === `cd ${this.initialDir}` ? `cd ${this.initialDir}` : command;

        // Write command to shell's stdin for continuous session tracking
        this.shellSession.stdin.write(`${safeCommand}\n`);

        // Send initial processing message
        await bot.sendMessage(chatId, "⏰| Executing command...", { replyToMessage: msg.message_id });
    }
};
