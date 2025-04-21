const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.generateImage = async (req, res, next) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45d-8f3f-4d90-ae7c-7dbf6c29c3d2", // sdxl
        input: { prompt }
      })
    });

    const data = await response.json();

    if (data?.error) {
      return res.status(500).json({ error: data.error });
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
          return res.status(200).json({ image: result.output[0] });
        } else if (result.status === "failed") {
          return res.status(500).json({ error: "Image generation failed" });
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s
      }
    };

    getResult();
  } catch (error) {
    console.error("Replicate Error:", error);
    res.status(500).json({ error: "Server error while generating image" });
  }
};
