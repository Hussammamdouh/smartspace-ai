const { chatWithGPT, generateImageWithDalle } = require("../services/openaiService");

exports.handleUnifiedChat = async (req, res, next) => {
  const { messages, model } = req.body;

  try {
    if (model === "chat") {
      const textOnlyMessages = messages.filter(
        (msg) => msg.role && typeof msg.content === "string"
      );
      const textResponse = await chatWithGPT(textOnlyMessages);
      return res.status(200).json({ role: "assistant", type: "text", content: textResponse });
    } else if (model === "image") {
      const lastPrompt = messages[messages.length - 1]?.content;
      if (!lastPrompt || typeof lastPrompt !== "string") {
        return res.status(400).json({ error: "Invalid or missing prompt." });
      }

      const { imageUrl, designId, prompt, usedItems } = await generateImageWithDalle(
        lastPrompt,
        req.user.id
      );

      return res.status(200).json({
        role: "assistant",
        type: "image",
        content: imageUrl,
        designId,
        prompt,
        usedItems,
      });
    } else {
      return res.status(400).json({ error: "Invalid model selection." });
    }
  } catch (err) {
    console.error("Unified Chat Error:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
