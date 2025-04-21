const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Chat endpoint using Gemini 1.5 Pro
exports.chatWithGemini = async (req, res) => {
  try {
    const { messages } = req.body;
    const userPrompt = messages?.[messages.length - 1]?.content;

    if (!userPrompt) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // ✅ Correct model
    const chat = model.startChat({ history: [] });

    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;

    res.status(200).json({
      content: response.text(),
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Gemini API request failed' });
  }
};
