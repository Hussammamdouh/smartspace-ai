import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { 
  FaImage, 
  FaDownload, 
  FaShare, 
  FaMagic,
  FaPalette,
  FaLightbulb,
  FaArrowRight,
  FaSpinner,
  FaStar,
  FaHeart,
  FaEdit,
  FaShoppingCart,
  FaCopy,
  FaCheck
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GenerateImage = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error("Please enter a description for the image");
      return;
    }

    if (prompt.length > 500) {
      toast.error("Description is too long (max 500 characters)");
      return;
    }

    setLoading(true);
    setError("");
    setImage("");
    
    try {
      const response = await axiosInstance.post('/replicate/generate', { 
        prompt: prompt.trim() 
      });
      
      if (response.data.status === 'success') {
        setImage(response.data.data.image);
        toast.success("Image generated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to generate image");
      }
    } catch (err) {
      console.error('Image generation error:', err);
      
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please wait a moment and try again.");
        toast.error("Too many requests. Please wait before trying again.");
      } else if (err.response?.status === 400) {
        setError("Invalid prompt. Please try a different description.");
        toast.error("Invalid prompt. Please try a different description.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        setError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to generate image. Please try again.");
        toast.error("Failed to generate image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const response = await axiosInstance.get(`/design/download-image?url=${encodeURIComponent(image)}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleShare = async () => {
    if (!image) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Generated Interior Design',
          text: 'Check out this AI-generated interior design!',
          url: image
        });
      } else {
        await navigator.clipboard.writeText(image);
        setCopied(true);
        toast.success("Image URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error("Failed to share image");
    }
  };

  const handleEditDesign = () => {
    if (!image) return;
    
    const designData = {
      imageUrl: image,
      prompt: prompt,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('editDesignData', JSON.stringify(designData));
    navigate('/edit-design');
  };

  const handlePurchaseItems = async () => {
    if (!image) return;
    
    try {
      const response = await axiosInstance.post('/design/extract-items', {
        prompt: prompt
      });
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        // Add items to cart (you'll need to implement this)
        toast.success(`${response.data.data.length} items found! Navigate to cart to purchase.`);
        navigate('/cart');
      } else {
        toast.info('No specific items found in this design');
      }
    } catch (error) {
      console.error('Error extracting items:', error);
      toast.error('Failed to extract items from design');
    }
  };

  const quickPrompts = [
    "Modern living room with floor-to-ceiling windows and minimalist furniture",
    "Cozy Scandinavian bedroom with warm lighting and natural materials",
    "Luxurious bathroom with marble tiles and freestanding bathtub",
    "Industrial-style kitchen with exposed brick and stainless steel appliances",
    "Bohemian dining room with eclectic decor and hanging plants"
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <nav className="flex items-center justify-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">AI Image Generator</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            AI
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Image Generator</span>
          </h1>
          <p className="text-[#A58077] text-lg max-w-2xl mx-auto">
            Transform your ideas into stunning interior design images with the power of artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Generation Form */}
          <div className="space-y-8">
            
            {/* Generation Form */}
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center">
                  <FaMagic className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Generate Design</h2>
                  <p className="text-[#A58077] text-sm">Describe your dream space</p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#E5CBBE]">
                    Describe your ideal room
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A modern living room with large windows, minimalist furniture, warm lighting, and a cozy fireplace..."
                    className="w-full p-4 rounded-xl bg-[#1e1e1e] border border-[#3C3C3C] focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077] resize-none transition-all duration-300"
                    rows={4}
                    maxLength={500}
                    disabled={loading}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#A58077]">
                      {prompt.length}/500 characters
                    </span>
                    {error && (
                      <span className="text-xs text-red-400">{error}</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Generating Design...</span>
                    </>
                  ) : (
                    <>
                      <FaImage />
                      <span>Generate Image</span>
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Prompts */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
              <div className="flex items-center space-x-3 mb-4">
                <FaLightbulb className="text-[#A58077]" />
                <h3 className="text-lg font-semibold text-[#E5CBBE]">Quick Prompts</h3>
              </div>
              <div className="space-y-3">
                {quickPrompts.map((promptText, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(promptText)}
                    className="w-full p-3 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 text-left text-sm border border-[#3C3C3C] hover:border-[#A58077]"
                  >
                    <FaPalette className="inline mr-2 text-[#A58077]" />
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-4 flex items-center">
                <FaStar className="text-[#A58077] mr-2" />
                Tips for Better Results
              </h3>
              <div className="space-y-3 text-sm text-[#A58077]">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#A58077] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Be specific about style, colors, and materials</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#A58077] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Mention lighting and mood you want to create</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#A58077] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include architectural details like windows or ceiling height</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#A58077] rounded-full mt-2 flex-shrink-0"></div>
                  <span>Specify furniture types and arrangements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Generated Image */}
          <div className="space-y-6">
            {image ? (
              <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-[#E5CBBE] mb-2">Generated Design</h2>
                  <p className="text-sm text-[#A58077] mb-4">
                    Based on: &quot;{prompt}&quot;
                  </p>
                </div>
                
                <div className="relative group">
                  <img 
                    src={image} 
                    alt="Generated Interior Design" 
                    className="w-full rounded-xl shadow-2xl group-hover:shadow-[#A58077]/20 transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/2C2C2C/A58077?text=Generated+Design';
                    }}
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDownload}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Download"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Share"
                      >
                        {copied ? <FaCheck /> : <FaShare />}
                      </button>
                      <button
                        onClick={handleEditDesign}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Edit Design"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={handlePurchaseItems}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Purchase Items"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                  >
                    {copied ? <FaCheck /> : <FaShare />}
                    <span>{copied ? 'Copied!' : 'Share'}</span>
                  </button>
                  <button
                    onClick={handleEditDesign}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                  >
                    <FaEdit />
                    <span>Edit Design</span>
                  </button>
                  <button
                    onClick={handlePurchaseItems}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                  >
                    <FaShoppingCart />
                    <span>Buy Items</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C] border-dashed min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-[#E5CBBE] mb-2">
                    Your Design Will Appear Here
                  </h3>
                  <p className="text-[#A58077] text-sm">
                    Enter a description and click generate to create your design
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateImage;
