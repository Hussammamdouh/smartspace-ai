const OpenAI = require("openai");

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

  console.log("🧠 Sending prompt to OpenAI:", prompt);

  const response = await openai.images.generate({
    model: "dall-e-3", // or "dall-e-2" if preferred
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
  });

  const imageUrl = response.data[0].url;
  return imageUrl;
};
