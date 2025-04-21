import { useState } from "react";
import axios from "axios";

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setImage("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/replicate/generate`, { prompt });
      setImage(res.data.image);
    } catch (err) {
      alert("Error generating image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl mb-4">Interior Image Generator</h1>
      <input
        type="text"
        placeholder="Describe the room..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="p-2 w-full text-black rounded"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-800"
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>
      {image && <img src={image} alt="Generated" className="mt-6 rounded-lg w-full max-w-md" />}
    </div>
  );
};

export default GenerateImage;
