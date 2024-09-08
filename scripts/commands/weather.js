const axios = require('axios');

module.exports = {
    config: {
        name: 'weather',
        aliases: ['climate'],
        category: 'tools',
        role: 0,
        cooldown: 5, // seconds
        version: '1.1.0',
        author: 'Your Name',
        description: 'Fetches the current weather for a given place.',
        usage: 'weather <place>'
    },

    onStart: async function({ msg, args, bot, config }) {
        if (!args[0]) {
            return bot.sendMessage(msg.chat.id, 'Please provide a place to search.', { replyToMessage: msg.message_id });
        }

        try {
            const apiKey = '060a6bcfa19809c2cd4d97a212b19273'; // Replace with your API key
            const place = encodeURIComponent(args.join(' ')); // Join all args to handle multi-word places
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${place}&units=metric&appid=${apiKey}`);
            
            const data = response.data;
            const name = data.name;
            const country = data.sys.country;
            const weatherDescription = data.weather[0].description;
            const weatherIcon = data.weather[0].icon;
            const temperature = `${data.main.temp.toFixed(1)}°C`;
            const feelsLike = `${data.main.feels_like.toFixed(1)}°C`;
            const minTemperature = `${data.main.temp_min.toFixed(1)}°C`;
            const maxTemperature = `${data.main.temp_max.toFixed(1)}°C`;
            const humidity = `${data.main.humidity}%`;
            const windSpeed = `${data.wind.speed.toFixed(1)} km/h`;
            const pressure = `${data.main.pressure} hPa`;
            const visibility = `${(data.visibility / 1000).toFixed(1)} km`;
            const clouds = `${data.clouds.all}%`;
            const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
            const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
            
            const weatherMessage = `
🌍 *PLACE:* ${name}, ${country}
☁️ *WEATHER:* ${weatherDescription} ![Icon](http://openweathermap.org/img/wn/${weatherIcon}.png)
🌡️ *TEMPERATURE:* ${temperature}
🌡️ *FEELS LIKE:* ${feelsLike}
📉 *MINIMUM TEMPERATURE:* ${minTemperature}
📈 *MAXIMUM TEMPERATURE:* ${maxTemperature}
💧 *HUMIDITY:* ${humidity}
🌬️ *WIND SPEED:* ${windSpeed}
💨 *PRESSURE:* ${pressure}
🌫️ *VISIBILITY:* ${visibility}
☀️ *SUNRISE:* ${sunrise}
🌇 *SUNSET:* ${sunset}
            `;

            bot.sendMessage(msg.chat.id, weatherMessage, { replyToMessage: msg.message_id }, { parseMode: 'Markdown' });
        } catch (error) {
            console.error('Error fetching weather data:', error);
            bot.sendMessage(msg.chat.id, 'Error fetching weather data. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};
