const axios = require("axios").default;
const cheerio = require("cheerio");
const BodyForm = require("form-data");
const Bluebird = require("bluebird");
const path = require("path").join;
const { fromBuffer } = require("file-type");
const { fetchBuffer, formatSize, getRandom, fetchJson } = require("./index");
const { createReadStream, unlinkSync, promises } = require("fs");

const webp2mp4 = (path) => {
	return new Bluebird((resolve, reject) => {
		const form = new BodyForm();
		form.append("new-image-url", "");
		form.append("new-image", createReadStream(path));
		console.log("Upload new file to ezgif...");
		axios({
			method: "post",
			url: "https://s6.ezgif.com/webp-to-mp4",
			data: form,
			headers: {
				"Content-Type": `multipart/form-data; boundary=${form._boundary}`,
			},
		})
			.then(({ data }) => {
				const bodyFormThen = new BodyForm();
				const $ = cheerio.load(data);
				const file = $('input[name="file"]').attr("value");
				bodyFormThen.append("file", file);
				bodyFormThen.append("convert", "Convert WebP to MP4!");
				console.log("Start converting...");
				axios({
					method: "post",
					url: "https://ezgif.com/webp-to-mp4/" + file,
					data: bodyFormThen,
					headers: {
						"Content-Type": `multipart/form-data; boundary=${bodyFormThen._boundary}`,
					},
				})
					.then(({ data }) => {
						const $ = cheerio.load(data);
						let result = "https:" + $("div#output > p.outfile > video > source").attr("src");
						resolve(result);
						console.log("Success converting");
					})
					.catch(reject);
			})
			.catch(reject);
	});
};

/**
 * Uploader API
 * @param {Buffer} fileData Your file
 * @param {"telegraph"|"uguu"|"anonfiles"} type File Hosting API
 */
const uploaderAPI = (fileData, type) =>
	new Bluebird(async (resolve, reject) => {
		const postFile = async (fileData, type) => {
			const { ext, mime } = await fromBuffer(fileData);
			const filePath = path("utils", mime.split("/")[0] + getRandom(`.${ext}`));
			const form = new BodyForm();
			await promises.writeFile(filePath, fileData);
			// Start Uploading
			console.log(`Uploading to ${type}...`);
			if (type === "telegraph") {
				form.append("file", createReadStream(filePath));
				const { data } = await axios.post("https://telegra.ph/upload", form, {
					responseType: "json",
					headers: { ...form.getHeaders() },
				});
				if (data.error) reject(data.error);
				return {
					host: "telegraph",
					data: {
						name: filePath.replace(/utils([\\\/])/i, ""),		/** Use regex to support Windows Path */
						url: "https://telegra.ph" + data[0].src,
						size: formatSize(fileData.length),
					},
				};
			} else if (type === "uguu") {
				form.append("files[]", createReadStream(filePath));
				const { data } = await axios.post("https://uguu.se/upload.php", form, {
					responseType: "json",
					headers: { ...form.getHeaders() },
				});
				return {
					host: "uguu",
					data: {
						url: data.files[0].url,
						name: data.files[0].name,
						size: formatSize(parseInt(data.files[0].size)),
					},
				};
			} else if (type === "anonfiles") {
				form.append("file", createReadStream(filePath));
				const { data } = await axios.post("https://api.anonfiles.com/upload", form, {
					responseType: "json",
					headers: { ...form.getHeaders() },
				});
				if (!data.status) reject(data.error.message);
				return {
					host: "anonfiles",
					data: {
						url: data.data.file.url.short,
						name: data.data.file.metadata.name,
						size: data.data.file.metadata.size.readable,
					},
				};
			}
		};
		try {
			const result = await postFile(fileData, type);
			unlinkSync(path("utils", result.data.name));
			console.log("Success");
			resolve(result);
		} catch (e) {
			reject(e);
		}
	});

/**
 * memeText -- add text to image
 * @param {Buffer} imageData
 * @param {string} top
 * @param {string} bottom
 * @returns {Promise<Buffer>}
 */
const memeText = (imageData, top, bottom) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!imageData) reject("No imageData");
			const imageUrl = (await uploaderAPI(imageData, "uguu")).data.url;
			let topText = top
				.trim()
				.replace(/\s/g, "_")
				.replace(/\?/g, "~q")
				.replace(/\%/g, "~p")
				.replace(/\#/g, "~h")
				.replace(/\//g, "~s");
			let bottomText = bottom
				.trim()
				.replace(/\s/g, "_")
				.replace(/\?/g, "~q")
				.replace(/\%/g, "~p")
				.replace(/\#/g, "~h")
				.replace(/\//g, "~s");

			let result = `https://api.memegen.link/images/custom/${topText}/${bottomText}.png?background=${imageUrl}`;
			let binResult = await fetchBuffer(result);
			resolve(binResult);
			binResult = null;
		} catch (e) {
			reject(e);
		}
	});


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
 * blackBox -- get response from gemini
 * @param {string} query
 * @param {name} query
 * @returns {Promise<Buffer>}
 */
const blackBox = (query, name) =>
	new Bluebird(async (resolve, reject) => {
		try {
			if (!query) reject("No query found");
			let queryTxt = query;
			let moreinfo = `You are a helpful AI assistant made for asking queries by SamirXYZ. And you should give only meaningful response of my queries too without nonesense. Let me introduce myself. I'm ${name}. Here's my query: \n${query}`
			let result = `https://joshweb.click/blackbox?prompt=${moreinfo}`;
			let bbxResult = await axios.get(result);
			const response = bbxResult.data.data;
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

/**
 * reminiAPI -- convert image to anime style using DrawEver API
 * @param {Buffer} imageData The image data buffer
 * @returns {Promise<Buffer>} A promise that resolves with the processed image data buffer
 */
const reminiAPI = async (imageData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!imageData) throw new Error("No image found");
            const imageUrl = (await uploaderAPI(imageData, "telegraph")).data.url;
            const result = `https://joshweb.click/remini?q=${imageUrl}`;
            
            // Download the processed image
            const processedImageResponse = await axios.get(result, { responseType: 'arraybuffer' });

            // Resolve with the processed image data buffer
            resolve(Buffer.from(processedImageResponse.data));
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
	webp2mp4,
	uploaderAPI,
	memeText,
	draweverAPI,
	geminiIMG,
	geminiTXT,
	blackBox,
	reminiAPI,
};
