const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_RETRIES = 3;

exports.chatWithGPT = async (messages) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages });
      return res.choices[0].message.content;
    } catch (err) {
      if (i === MAX_RETRIES - 1) throw err;
      await new Promise(res => setTimeout(res, 1000)); // wait 1s
    }
  }
};

exports.generateImageWithDalle = async (prompt) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });
  return response.data[0].url;
};
