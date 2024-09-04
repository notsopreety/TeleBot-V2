const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

module.exports = {
    config: {
        name: "gitclone",
        aliases: ["clone", "repository", "repo"],
        role: 0,
        cooldown: 15,  // Cooldown to prevent overuse
        version: '1.0.2',
        author: 'Samir Thakuri',
        category: "utility",
        description: "Clone a public GitHub repository and send it as a .zip file along with repository data",
        usage: "gitclone <GitHub_Repository_URL>"
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        const repoUrl = args[0];
        if (!repoUrl || !repoUrl.startsWith('https://github.com/')) {
            return bot.sendMessage(chatId, `⚠️ *Invalid URL! Please provide a valid GitHub repository link.*\n💡 Usage: \`${this.config.usage}\``, { replyToMessage: msg.message_id });
        }

        // Regex to extract the user and repository name from the URL
        const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
        if (!regex.test(repoUrl)) {
            return bot.sendMessage(chatId, '⚠️ *Link is incorrect.*', { replyToMessage: msg.message_id });
        }

        const [_, user, repo] = repoUrl.match(regex) || [];
        const cleanRepo = repo.replace(/.git$/, '');

        const apiUrl = `https://api.github.com/repos/${user}/${cleanRepo}`;
        const downloadUrl = `https://api.github.com/repos/${user}/${cleanRepo}/zipball`;

        try {

            // Fetch repository metadata from GitHub
            const repoResponse = await fetch(apiUrl);
            const repoData = await repoResponse.json();

            if (repoResponse.status !== 200) {
                throw new Error('Repository not found or API limit exceeded.');
            }

            // Fetch the filename for the .zip file
            const headResponse = await fetch(downloadUrl, { method: 'HEAD' });
            const filename = headResponse.headers
                .get('content-disposition')
                .match(/attachment; filename=(.*)/)[1];


            // Send the repository as a .zip file
            await bot.sendDocument(chatId, downloadUrl, {
                caption: `🎉 Repository cloned successfully!\n\n🚀 Repository: \`${repoData.full_name}\`\n👤 Author: \`${repoData.owner.login}\`\n📝 Description: ${repoData.description || 'No description provided.'}\n⭐ Stars: ${repoData.stargazers_count}\n🍴 Forks: ${repoData.forks_count}\n📦 File: \`${filename}\``,
                replyToMessage: msg.message_id
            });

        } catch (error) {
            console.error("Error processing gitclone command:", error);
            // React with a cross mark emoji to indicate failure
            await bot.react(msg.message_id, '❌');
            bot.sendMessage(chatId, '⚠️ *Failed to fetch the repository. Please ensure the repository is public and the URL is correct.*', { replyToMessage: msg.message_id });
        }
    }
};

