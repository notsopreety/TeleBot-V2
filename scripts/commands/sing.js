const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const path = require("path");

module.exports = {
    config: {
        name: "sing",
        aliases: ["music", "sing", "play"],
        category: "media",
        role: 0,
        cooldowns: 5,
        version: "1.0.0",
        author: "Samir Thakuri",
        description: "Download music from YouTube.",
        usage: "sing <title>",
    },

    onStart: async function ({ bot, chatId, args }) {
        try {
            const search = args.join(" ");

            if (!search) {
                return bot.sendMessage(
                    chatId,
                    `Please provide a search query. Usage: /sing song name`
                );
            }

            const downloadMsg = await bot.sendMessage(
                chatId,
                `✅ | Searching music for "${search}".\n⏳ | Please wait...`
            );

            const searchResults = await yts(search);
            if (!searchResults.videos.length) {
                return bot.sendMessage(
                    chatId,
                    "No music found for your query."
                );
            }

            const music = searchResults.videos[0];
            const musicUrl = music.url;

            // Ensure the cache directory exists
            const cacheDir = path.join(__dirname, "cache");
            fs.ensureDirSync(cacheDir);

            const stream = ytdl(musicUrl, { filter: "audioonly" });

            stream.on("info", (info) => {
                console.info(
                    "[DOWNLOADER]",
                    `Downloading music: ${info.videoDetails.title}`
                );
            });

            const fileName = `${music.title}.mp3`;
            const filePath = path.join(cacheDir, fileName);

            const fileWriteStream = fs.createWriteStream(filePath);
            stream.pipe(fileWriteStream);

            fileWriteStream.on("finish", async () => {
                await bot.deleteMessage(chatId, downloadMsg.message_id);

                const stats = fs.statSync(filePath);
                const fileSizeInBytes = stats.size;
                const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

                if (fileSizeInBytes > 226214400) { // Check for file size > 216MB
                    fs.unlinkSync(filePath);
                    return bot.sendMessage(
                        chatId,
                        "❌ The file could not be sent because it is larger than 216MB."
                    );
                }

                const caption = `💁‍♀️ | Here's your music\n\n🔮 | Title: ${music.title}\n⏰ | Duration: ${music.duration.timestamp}\n👤 | Uploaded by: ${music.author.name}\n📅 | Published on: ${music.ago}\n📥 | File Size: ${fileSizeInMegabytes.toFixed(2)} MB`;

                bot.sendAudio(chatId, fs.createReadStream(filePath), {
                    caption,
                })
                    .then(() => {
                        // Delete the file after sending the response
                        fs.unlinkSync(filePath);
                    })
                    .catch((error) => {
                        console.error("[ERROR]", error);
                        bot.sendMessage(
                            chatId,
                            "An error occurred while sending the audio."
                        );
                    });
            });

            fileWriteStream.on("error", (error) => {
                console.error("[ERROR]", error);
                bot.sendMessage(
                    chatId,
                    "An error occurred while writing the file."
                );
            });

        } catch (error) {
            console.error("[ERROR]", error);
            bot.sendMessage(
                chatId,
                "An error occurred while processing the command."
            );
        }
    },
};
