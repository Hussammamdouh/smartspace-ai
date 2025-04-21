// src/pages/EditDesignPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditDesignPage = () => {
  const [furniture, setFurniture] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Sofa");
  const [canvasImage, setCanvasImage] = useState("/images/empty-room.jpg"); // Placeholder for room
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const categories = ["Sofas", "Beds", "Chairs", "Tables", "Lamp"];

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`);
        setFurniture(res.data.data);
      } catch (err) {
        console.error("Failed to fetch inventory");
      }
    };
    fetchInventory();
  }, []);

  const handleAddToCanvas = async (itemName) => {
    try {
      setLoading(true);
      const prompt = `Edit the image to add a ${itemName} in the room.`;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ai/generate-image`, { prompt });
      setCanvasImage(res.data.imageUrl);
    } catch (err) {
      alert("Failed to generate edited image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#181818] text-white">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#1e1e1e] p-4 overflow-y-auto">
        <input
          type="text"
          placeholder="🔍 Search furniture"
          className="w-full mb-4 p-2 rounded bg-[#2a2a2a] text-white"
        />
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`w-full text-left py-2 px-3 rounded ${
                selectedCategory === cat ? "bg-[#A58077]" : "bg-[#2c2c2c]"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Furniture Items</h3>
          <div className="grid grid-cols-2 gap-2">
            {furniture
              .filter((f) => f.type.toLowerCase().includes(selectedCategory.toLowerCase()))
              .map((item) => (
                <button
                  key={item._id}
                  className="bg-[#2c2c2c] p-2 rounded text-sm hover:bg-[#A58077] transition"
                  onClick={() => handleAddToCanvas(item.name)}
                >
                  <img src={item.filePath} alt={item.name} className="w-full h-16 object-cover rounded mb-1" />
                  {item.name}
                </button>
              ))}
          </div>
        </div>
      </aside>

      {/* Canvas Section */}
      <main className="flex-1 p-6 flex flex-col items-center justify-between">
        <img
          src={canvasImage}
          alt="Room Canvas"
          className="max-h-[80vh] w-auto rounded-lg shadow-lg object-contain"
        />
        {loading && <p className="mt-2 text-[#A58077] animate-pulse">Generating...</p>}
      </main>

      {/* Properties Sidebar */}
      <aside className="w-[250px] bg-gradient-to-b from-[#2a2a2a] to-[#1e1e1e] p-4">
        <h3 className="text-xl font-bold mb-4">Properties</h3>
        <label className="block mb-2 text-sm">Width & Height</label>
        <div className="flex gap-2 mb-4">
          <input type="number" placeholder="120" className="w-full p-2 rounded bg-[#2c2c2c]" />
          <input type="number" placeholder="80" className="w-full p-2 rounded bg-[#2c2c2c]" />
        </div>
        <label className="block mb-2 text-sm">Rotation</label>
        <input type="range" min="0" max="360" className="w-full mb-4" />
        <label className="block mb-2 text-sm">Color</label>
        <div className="flex gap-2 mb-4">
          {["red", "blue", "green", "yellow", "purple"].map((c) => (
            <div key={c} className={`w-6 h-6 rounded-full bg-${c}-500`} />
          ))}
        </div>
        <div className="mt-12 space-y-3">
          <button className="w-full py-2 rounded bg-[#2c2c2c] hover:bg-[#A58077]">Save Draft</button>
          <button className="w-full py-2 rounded bg-[#A58077] hover:bg-[#E5CBBE] text-white">
            Export Design
          </button>
        </div>
      </aside>
    </div>
  );
};

export default EditDesignPage;
