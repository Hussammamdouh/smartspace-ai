const OpenAI = require("openai");
const logger = require("./logger");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../config/cloudinary');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateRoomImage = async (preferences, matchingItems) => {
  const prompt = `
    Generate a high-quality interior design image of a ${preferences.roomType}.
    Style: ${preferences.style}.
    Color palette: ${preferences.colorPalette.join(', ')}.
    Dimensions: ${preferences.dimensions || 'not specified'}.
    Budget: ${preferences.budget || 'not specified'}.
    Additional notes: ${preferences.additionalNotes || 'N/A'}.
    Include matching furniture: ${matchingItems.map(item => item.name).join(', ')}.
  `;

  logger.info("🧠 Sending prompt to OpenAI:", prompt);

  const response = await openai.images.generate({
    model: "dall-e-3", // or "dall-e-2" if preferred
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
  });

  const imageUrl = response.data[0].url;

  // Download the image to a temp file
  const tempFilePath = path.join(__dirname, `temp_${Date.now()}.png`);
  const writer = fs.createWriteStream(tempFilePath);
  const imageResponse = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream',
  });
  await new Promise((resolve, reject) => {
    imageResponse.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  // Upload to Cloudinary
  const cloudinaryResult = await uploadToCloudinary({ path: tempFilePath }, 'ai-interior-design');

  // Clean up temp file
  fs.unlinkSync(tempFilePath);

  return {
    url: cloudinaryResult.url,
    public_id: cloudinaryResult.public_id,
    originalUrl: imageUrl
  };
};
