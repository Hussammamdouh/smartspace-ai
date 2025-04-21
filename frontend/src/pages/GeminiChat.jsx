// frontend/src/pages/ImageGenerator.jsx
import { useState } from "react";
import axios from "axios";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImage("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/gemini/generate-image`, {
        prompt,
      });
      setImage(res.data.image);
    } catch (err) {
      console.error("Image generation error:", err);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <h1 className="text-4xl font-bold mb-6">Interior Design Image Generator</h1>

      <form onSubmit={handleGenerate} className="flex gap-4 mb-6">
        <input
          type="text"
          className="flex-1 p-3 rounded bg-[#E5CBBE] text-[#181818]"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your room..."
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[#A58077] text-white rounded hover:opacity-80"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {image && (
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img src={image} alt="Generated Interior" className="w-full max-w-3xl rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
