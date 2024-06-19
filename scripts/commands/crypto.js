const axios = require('axios');

module.exports = {
    config: {
        name: "crypto",
        aliases: ["cryptocurrency"],
        role: 0,
        cooldowns: 5,
        version: '1.2.0',
        author: 'Samir Thakuri',
        category: "finance",
        description: "Fetch data of any cryptocurrency and display its details.",
        usage: "crypto <currency>",
    },

    onStart: async function ({ bot, chatId, args, msg }) {
            try {
                if (!args[0]) {
                    bot.sendMessage(chatId, `⚠️ Please specify a valid type of crypto coin.\n\nLists of Available Coins:\nBitcoin\nEthereum\nTether\nBinance\nUSD Coin\nHEX\nSolana\nXRP\nTerra\nADA\nUST\nDOGE`, { replyToMessage: msg.message_id });
                    return;
                }

                let type;
                switch (args[0].toLowerCase()) {
                    case "bitcoin":
                    case "btc":
                        type = "btc-bitcoin";
                        break;
                    case "ethereum":
                    case "eth":
                        type = "eth-ethereum";
                        break;
                    case "tether":
                    case "usdt":
                        type = "usdt-tether";
                        break;
                    case "binance":
                    case "bnb":
                        type = "bnb-binance-coin";
                        break;
                    case "usd coin":
                    case "usdc":
                        type = "usdc-usd-coin";
                        break;
                    case "hex":
                        type = "hex-hex";
                        break;
                    case "solana":
                    case "sol":
                        type = "sol-solana";
                        break;
                    case "xrp":
                        type = "xrp-xrp";
                        break;
                    case "terra":
                    case "luna":
                        type = "luna-terra";
                        break;
                    case "ada":
                    case "cardano":
                        type = "ada-cardano";
                        break;
                    case "ust":
                    case "terrausd":
                        type = "ust-terrausd";
                        break;
                    case "doge":
                    case "dogecoin":
                        type = "doge-dogecoin";
                        break;
                    default:
                        bot.sendMessage(chatId, `⚠️ Please specify a valid type of crypto coin.\n\nLists of Available Coins:\nBitcoin\nEthereum\nTether\nBinance\nUSD Coin\nHEX\nSolana\nXRP\nTerra\nADA\nUST\nDOGE`, { replyToMessage: msg.message_id });
                        return;
                }

                // Fetch data from Coinpaprika API
                const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${type}`);

                // Extract relevant data
                const data = response.data;

                // Extracting image URL
                const imageURL = `https://static.coinpaprika.com/coin/${type}/logo.png?rev=10557311`;

                // Constructing reply message with emojis
                const replyMessage = `
📊 ${data.name} (${data.symbol}) 🚀
Rank: #${data.rank} 🥇
Price (USD): 💵 $${data.quotes.USD.price.toFixed(2)}
24h Volume (USD): 💰 $${data.quotes.USD.volume_24h.toFixed(2)}
Market Cap (USD): 💹 $${data.quotes.USD.market_cap.toFixed(2)}
24h Change: ${data.quotes.USD.percent_change_24h.toFixed(2)}% ${data.quotes.USD.percent_change_24h > 0 ? "📈" : "📉"}
ATH Price (USD): 💎 $${data.quotes.USD.ath_price.toFixed(2)}
ATH Date: 📅 ${new Date(data.quotes.USD.ath_date).toDateString()}
`;

                bot.sendPhoto(chatId, imageURL, { caption: replyMessage.trim() }, { replyToMessage: msg.message_id });

            } catch (error) {
                console.error('Error fetching or sending cryptocurrency data:', error);
                bot.sendMessage(chatId, "An error occurred while fetching cryptocurrency data. Please try again later.", { replyToMessage: msg.message_id });
            }
        }
};
