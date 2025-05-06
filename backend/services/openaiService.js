const { OpenAI } = require("openai");
const InventoryItem = require("../models/InventoryItem");
const GeneratedDesign = require("../models/GeneratedDesign");
const { extractPromptContext } = require("../utils/promptParser");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 3;

exports.chatWithGPT = async (messages) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages });
      return res.choices[0].message.content;
    } catch (err) {
      if (i === MAX_RETRIES - 1) throw err;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
};

exports.generateImageWithDalle = async (userPrompt, userId) => {
  const context = extractPromptContext(userPrompt);

  const filter = { isDeleted: false };
  if (context.category) filter.category = context.category;
  if (context.style) filter.style = context.style;
  if (context.color) filter.color = new RegExp(context.color, "i");

  const items = await InventoryItem.find(filter).limit(5);
  if (!items.length) throw new Error("No matching furniture found in the inventory.");

  const itemNames = items.map(item => item.name).join(", ");
  const augmentedPrompt = `
    ${userPrompt.trim()}.
    Include only these furniture items: ${itemNames}.
    Generate a photorealistic image with natural lighting.
    Do not include cartoon or 3D-rendered styles.
  `;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: augmentedPrompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  const imageUrl = response.data[0].url;

  const design = await GeneratedDesign.create({
    user: userId,
    prompt: augmentedPrompt,
    items: items.map(i => i._id),
    imageUrl,
    source: "dalle",
  });

  return {
    imageUrl,
    designId: design._id,
    prompt: augmentedPrompt,
    usedItems: items,
  };
};
