const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro", // ✅ updated model
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = await result.response;
    const content = response.text();

    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error("Gemini Image Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate image", error });
  }
};
