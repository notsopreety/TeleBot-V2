const axios = require("axios").default;
const cheerio = require("cheerio");
const BodyForm = require("form-data");
const Bluebird = require("bluebird");
const path = require("path").join;
const { fromBuffer } = require("file-type");
const { fetchBuffer, formatSize, getRandom, fetchJson } = require("./index");
const { createReadStream, unlinkSync, promises } = require("fs");

const { uploaderAPI } = require("./uploader")

/**
 * geminiIMG -- add text to image
 * @param {Buffer} imageData
 * @param {string} query
 * @returns {Promise<Buffer>}
 */
const geminiIMG = (imageData, query) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!imageData) reject("No imageData");
			const imageUrl = (await uploaderAPI(imageData, "uguu")).data.url;
			let queryTxt = query;

			let result = `https://apibysamir.onrender.com/geminiv2?prompt=${queryTxt}&imgUrl=${imageUrl}&apikey=APIKEY`;
			let geminiResult = await axios.get(result);
			const response = geminiResult.data.response;
			resolve(response);
			response = null;
		} catch (e) {
			reject(e);
		}
	});


/**
 * geminiTXT -- get response from gemini
 * @param {string} query
 * @param {string} chatID
 * @returns {Promise<Buffer>}
 */
const geminiTXT = (query, chatID) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!query) reject("No query found");
			if (!chatID) reject("No chatID found");
			let queryTxt = query;

			let result = `https://apibysamir.onrender.com/gemini?query=${query}&chatid=${chatID}&apikey=APIKEY`;
			let geminiResult = await axios.get(result);
			const response = geminiResult.data.response;
			resolve(response);
			response = null;
		} catch (e) {
			reject(e);
		}
	});


/**
 * chatGPT4 -- get response from chatGPT4
 * @param {string} prompt
 * @param {string} userID
 * @returns {Promise<Buffer>}
 */
const chatGPT4 = (prompt, userID) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!prompt) reject("No prompt found");
			if (!userID) reject("No userID found");

			let result = `http://94.130.129.40:8370/gpt4?prompt=${prompt}&uid=${userID}`;
			let gptResponse = await axios.get(result);
			const response = gptResponse.data.gpt4;
			resolve(response);
			response = null;
		} catch (e) {
			reject(e);
		}
	});


/**
 * metaAI -- get response from metaAI
 * @param {string} query
 * @param {string} chatID
 * @returns {Promise<Buffer>}
 */
const metaAI = (query, chatID) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!query) reject("No query found");
			let result = `https://metallamaapi.onrender.com/ai?msg=${query}&id=${chatID}`;
			let metaat = await axios.get(result);
			const response = metaat.data.response;
			resolve(response);
			response = null;
		} catch (e) {
			reject(e);
		}
	});


/**
 * draweverAPI -- convert image to anime style using DrawEver API
 * @param {Buffer} imageData The image data buffer
 * @returns {Promise<Buffer>} A promise that resolves with the processed image data buffer
 */
const draweverAPI = async (imageData) => {
    try {
        // Upload the image using uploaderAPI
        const { data: { url } } = await uploaderAPI(imageData, "uguu");

        // Convert image buffer to base64 string
        const base64String = imageData.toString('base64');

        // Call the DrawEver API to process the image
        const apiResponse = await axios.post('https://www.drawever.com/api/photo-to-anime', {
            data: `data:image/png;base64,${base64String}`,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Retrieve the processed image URL
        const processedImageUrl = 'https://www.drawever.com' + (apiResponse.data.urls[1] || apiResponse.data.urls[0]);

        // Download the processed image
        const processedImageResponse = await axios.get(processedImageUrl, { responseType: 'arraybuffer' });

        // Return the processed image data buffer
        return Buffer.from(processedImageResponse.data);
    } catch (error) {
        throw new Error("Error processing image with DrawEver API");
    }
};



const { Hercai } = require('hercai');
const herc = new Hercai();

/**
 * hercAI -- get response from Hercai
 * @param {string} query - The query to send to Hercai
 * param {string} model - The name to include in the query context
 * @returns {Promise<string>} - A Promise that resolves to the response from Hercai
 */
const hercAI = (query) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!query) reject("No query found");
      // Sending the query to Hercai

        /* Available Models */
        /* "v3" , "v3-32k" , "turbo" , "turbo-16k" , "gemini" */
        /* Default Model; "v3" */
      const response = await herc.question({ model: "v3", content: query });
      
      resolve(response.reply);
    } catch (error) {
      reject(error);
    }
  });

/**
 * mistral -- get response from mistral
 * @param {string} query
 * @param {name} query
 * @returns {Promise<Buffer>}
 */
const mistral = (query, name) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!query) reject("No query found");
			let queryTxt = query;
			let moreinfo = `You are a helpful AI assistant made for asking queries by SamirXYZ. And you should give only meaningful response of my queries too without nonesense. Let me introduce myself. I'm ${name}. Here's my query: \n${query}`
			let result = `https://api.gurusensei.workers.dev/mistral?text=${moreinfo}`;
			let bbxResult = await axios.get(result);
			const response = bbxResult.data.response.response;
			resolve(response);
			response = null;
		} catch (e) {
			reject(e);
		}
	});


/**
 * upscaleAPI -- add text to image
 * @param {Buffer} imageData
 * @returns {Promise<Buffer>}
 */
const upscaleAPI = (imageData) =>
	new Bluebird(async (resolve, reject) => {
			try {
					if (!imageData) throw new Error("No imageData");

					// Assuming uploaderAPI is defined somewhere else and returns the image URL
					const imageUrl = (await uploaderAPI(imageData, "uguu")).data.url;

					// Construct the URL for the upscale API with the image URL
					const upscaleUrl = `https://replicateapi-391j.onrender.com/upscale?imgurl=${imageUrl}`;

					// Fetch the response from the upscale API using axios
					const response = await axios.get(upscaleUrl);

					// Extract the upscaled image URL from the response data
					const upscaledImageUrl = response.data.response;

					// Fetch the buffer of the upscaled image
					const upscaledImageBuffer = await fetchBuffer(upscaledImageUrl);

					resolve(upscaledImageBuffer);
			} catch (error) {
					reject(error);
			}
	});

module.exports = {
	draweverAPI,
	geminiIMG,
	geminiTXT,
	metaAI,
	upscaleAPI,
  hercAI,
  chatGPT4,
	mistral,
};
