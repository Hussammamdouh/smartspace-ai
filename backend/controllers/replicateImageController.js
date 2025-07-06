const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { APIError } = require("../middlewares/errorHandler");

exports.generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return next(new APIError('Prompt is required and must be a non-empty string', 400));
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45d-8f3f-4d90-ae7c-7dbf6c29c3d2", // sdxl
        input: { prompt: prompt.trim() }
      })
    });

    const data = await response.json();

    if (data?.error) {
      return next(new APIError(`Replicate API error: ${data.error}`, 500));
    }

    // Polling the status
    const getResult = async () => {
      let result;
      while (!result || result.status === "processing") {
        const check = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        });
        result = await check.json();
        if (result.status === "succeeded") {
          return res.status(200).json({ 
            status: 'success',
            data: { image: result.output[0] }
          });
        } else if (result.status === "failed") {
          return next(new APIError("Image generation failed", 500));
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s
      }
    };

    getResult();
  } catch (error) {
    next(error);
  }
};
