import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { 
  FaArrowLeft, 
  FaSave, 
  FaDownload, 
  FaPlus, 
  FaMinus, 
  FaPalette, 
  FaPaintBrush,
  FaUndo,
  FaMagic,
  FaSearch,
  FaTimes,
  FaCog,
  FaLayerGroup
} from "react-icons/fa";

const EditDesignPage = () => {
  const [furniture, setFurniture] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("living room");
  const [originalImage, setOriginalImage] = useState("/images/empty-room.jpg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [designData, setDesignData] = useState(null);
  const [showFurniturePanel, setShowFurniturePanel] = useState(true);
  const [showControlsPanel, setShowControlsPanel] = useState(true);
  
  // Design editing state
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [removedFurniture, setRemovedFurniture] = useState([]);
  const [styleChanges, setStyleChanges] = useState({
    style: 'modern',
    colorScheme: 'neutral',
    lighting: 'natural',
    mood: 'cozy'
  });
  const [roomChanges, setRoomChanges] = useState({
    layout: 'open',
    size: 'medium',
    windows: 'standard'
  });
  const [editHistory, setEditHistory] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const navigate = useNavigate();
  const categories = ["living room", "bedroom", "kitchen", "bathroom", "child bedroom"];
  
  const styleOptions = {
    style: ['modern', 'classic', 'vintage', 'minimalist', 'bohemian', 'industrial', 'scandinavian'],
    colorScheme: ['neutral', 'warm', 'cool', 'monochrome', 'colorful', 'earthy', 'pastel'],
    lighting: ['natural', 'warm', 'cool', 'dramatic', 'soft', 'bright'],
    mood: ['cozy', 'elegant', 'energetic', 'calm', 'romantic', 'professional']
  };

  const roomOptions = {
    layout: ['open', 'closed', 'split', 'studio'],
    size: ['small', 'medium', 'large', 'extra-large'],
    windows: ['standard', 'large', 'floor-to-ceiling', 'minimal', 'bay']
  };

  useEffect(() => {
    // Load design data from localStorage if available
    const savedDesignData = localStorage.getItem('designToEdit');
    if (savedDesignData) {
      try {
        const parsedData = JSON.parse(savedDesignData);
        setDesignData(parsedData);
        setOriginalImage(parsedData.imageUrl || "/images/empty-room.jpg");
        localStorage.removeItem('designToEdit'); // Clear after loading
      } catch (error) {
        console.error('Error parsing design data:', error);
      }
    }

    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/inventory');
        setFurniture(response.data.data || []);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        toast.error("Failed to fetch inventory.");
        setError("Failed to load furniture items");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Track changes for unsaved changes indicator
  useEffect(() => {
    const hasChanges = selectedFurniture.length > 0 || 
                      removedFurniture.length > 0 || 
                      editHistory.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [selectedFurniture, removedFurniture, editHistory]);

  const addFurnitureToDesign = (item) => {
    setSelectedFurniture(prev => [...prev, item]);
    setEditHistory(prev => [...prev, {
      type: 'add',
      item: item,
      timestamp: new Date()
    }]);
    toast.success(`Added ${item.name} to design`);
  };

  const removeFurnitureFromDesign = (itemId) => {
    const item = selectedFurniture.find(f => f._id === itemId);
    setSelectedFurniture(prev => prev.filter(f => f._id !== itemId));
    setRemovedFurniture(prev => [...prev, item]);
    setEditHistory(prev => [...prev, {
      type: 'remove',
      item: item,
      timestamp: new Date()
    }]);
    toast.success(`Removed ${item.name} from design`);
  };

  const updateStyle = (category, value) => {
    setStyleChanges(prev => ({
      ...prev,
      [category]: value
    }));
    setEditHistory(prev => [...prev, {
      type: 'style',
      category,
      value,
      timestamp: new Date()
    }]);
    toast.success(`Updated ${category} to ${value}`);
  };

  const updateRoom = (category, value) => {
    setRoomChanges(prev => ({
      ...prev,
      [category]: value
    }));
    setEditHistory(prev => [...prev, {
      type: 'room',
      category,
      value,
      timestamp: new Date()
    }]);
    toast.success(`Updated ${category} to ${value}`);
  };

  const undoLastChange = () => {
    if (editHistory.length === 0) return;
    
    const lastChange = editHistory[editHistory.length - 1];
    setEditHistory(prev => prev.slice(0, -1));
    
    switch (lastChange.type) {
      case 'add':
        setSelectedFurniture(prev => prev.filter(f => f._id !== lastChange.item._id));
        break;
      case 'remove':
        setSelectedFurniture(prev => [...prev, lastChange.item]);
        setRemovedFurniture(prev => prev.filter(f => f._id !== lastChange.item._id));
        break;
      case 'style':
        setStyleChanges(prev => ({
          ...prev,
          [lastChange.category]: editHistory[editHistory.length - 2]?.value || 'modern'
        }));
        break;
      case 'room':
        setRoomChanges(prev => ({
          ...prev,
          [lastChange.category]: editHistory[editHistory.length - 2]?.value || 'open'
        }));
        break;
    }
    toast.success('Undid last change');
  };

  const clearAllChanges = () => {
    setSelectedFurniture([]);
    setRemovedFurniture([]);
    setStyleChanges({
      style: 'modern',
      colorScheme: 'neutral',
      lighting: 'natural',
      mood: 'cozy'
    });
    setRoomChanges({
      layout: 'open',
      size: 'medium',
      windows: 'standard'
    });
    setEditHistory([]);
    toast.success('Cleared all changes');
  };

  const generateFinalDesign = async () => {
    if (!hasUnsavedChanges) {
      toast.error('No changes to apply');
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Build comprehensive prompt from all changes
      const furnitureList = selectedFurniture.map(item => item.name).join(', ');
      const removedList = removedFurniture.map(item => item.name).join(', ');
      
      let prompt = `Create a new interior design for a ${selectedCategory} with the following specifications:\n\n`;
      
      if (selectedFurniture.length > 0) {
        prompt += `Furniture to include: ${furnitureList}\n`;
      }
      
      if (removedFurniture.length > 0) {
        prompt += `Furniture to remove: ${removedList}\n`;
      }
      
      prompt += `\nStyle specifications:\n`;
      prompt += `- Design style: ${styleChanges.style}\n`;
      prompt += `- Color scheme: ${styleChanges.colorScheme}\n`;
      prompt += `- Lighting: ${styleChanges.lighting}\n`;
      prompt += `- Mood: ${styleChanges.mood}\n`;
      
      prompt += `\nRoom specifications:\n`;
      prompt += `- Layout: ${roomChanges.layout}\n`;
      prompt += `- Size: ${roomChanges.size}\n`;
      prompt += `- Windows: ${roomChanges.windows}\n`;
      
      prompt += `\nRequirements:\n`;
      prompt += `- Photorealistic quality with natural lighting\n`;
      prompt += `- Professional interior design photography style\n`;
      prompt += `- High-end, magazine-quality appearance\n`;
      prompt += `- Proper furniture placement and room layout\n`;
      prompt += `- Make it look cohesive and well-designed`;

      const response = await axiosInstance.post('/ai/generate-image', { 
        prompt: prompt.trim(),
        style: styleChanges.style,
        size: '1024x1024'
      });
      
      if (response.data.status === 'success') {
        const newImageUrl = response.data.data.imageUrl;
        setOriginalImage(newImageUrl);
        
        // Clear all changes after successful generation
        setSelectedFurniture([]);
        setRemovedFurniture([]);
        setEditHistory([]);
        setHasUnsavedChanges(false);
        
        toast.success('Design generated successfully!');
      } else {
        throw new Error(response.data.message || "Failed to generate design");
      }
    } catch (err) {
      console.error('Error generating design:', err);
      
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please wait before trying again.");
        toast.error("Too many requests. Please wait before trying again.");
      } else if (err.response?.status === 400) {
        setError("Invalid request. Please check your changes.");
        toast.error("Invalid request. Please check your changes.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        setError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to generate design. Please try again.");
        toast.error("Failed to generate design. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    try {
      // Save design preferences
      await axiosInstance.post('/design/preferences', {
        roomType: selectedCategory,
        style: styleChanges.style,
        colorPalette: [styleChanges.colorScheme],
        budget: 0,
        dimensions: roomChanges.size,
        additionalNotes: 'AI edited design with custom specifications'
      });
      
      toast.success('Design saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving design:', err);
      toast.error('Failed to save design');
    }
  };

  const handleDownload = () => {
    if (originalImage === "/images/empty-room.jpg") {
      toast.error("No design to download");
      return;
    }
    
    const link = document.createElement('a');
    link.href = originalImage;
    link.download = `edited-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Design downloaded!");
  };

  const filteredFurniture = furniture.filter(item => 
    item.category?.toLowerCase().includes(selectedCategory.toLowerCase()) &&
    (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] text-[#E5CBBE] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#2C2C2C]/80 backdrop-blur-sm border-b border-[#3C3C3C] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-[#3C3C3C]"></div>
              
              <div>
                <h1 className="text-2xl font-bold text-[#E5CBBE]">Design Studio</h1>
                <p className="text-[#A58077] text-sm">Create your perfect interior design</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 bg-yellow-600/20 border border-yellow-600/30 text-yellow-400 px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Unsaved Changes</span>
                </div>
              )}
              
              <button
                onClick={undoLastChange}
                disabled={editHistory.length === 0}
                className="p-3 bg-[#2C2C2C] text-[#A58077] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo last change"
              >
                <FaUndo size={16} />
              </button>
              
              <button
                onClick={clearAllChanges}
                disabled={!hasUnsavedChanges}
                className="px-4 py-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              
              <button
                onClick={generateFinalDesign}
                disabled={!hasUnsavedChanges || loading}
                className="px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader size={16} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FaMagic />
                    <span>Generate Design</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Furniture Selection */}
        <div className={`w-80 bg-[#1e1e1e] border-r border-[#3C3C3C] transition-all duration-300 flex-shrink-0 ${showFurniturePanel ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 flex-shrink-0">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E5CBBE] flex items-center gap-2">
                  <FaLayerGroup />
                  Furniture Library
                </h2>
                <button
                  onClick={() => setShowFurniturePanel(false)}
                  className="p-2 text-[#A58077] hover:text-[#E5CBBE] hover:bg-[#2C2C2C] rounded-lg transition-all duration-200"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
                <input
                  type="text"
                  placeholder="Search furniture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#2C2C2C] text-white rounded-lg border border-[#3C3C3C] focus:border-[#A58077] focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-200"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#A58077] mb-3 uppercase tracking-wide">Room Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedCategory === cat 
                          ? "bg-[#A58077] text-white shadow-lg" 
                          : "bg-[#2C2C2C] text-[#A58077] hover:bg-[#3C3C3C] hover:text-[#E5CBBE]"
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Furniture Grid - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 pt-0">
                <h3 className="text-sm font-semibold text-[#A58077] mb-3 uppercase tracking-wide">Available Items</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader size={32} />
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-sm p-4 bg-red-600/10 rounded-lg">{error}</div>
                ) : filteredFurniture.length === 0 ? (
                  <div className="text-[#A58077] text-sm p-4 bg-[#2C2C2C] rounded-lg text-center">
                    No furniture found
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto custom-scrollbar pr-2">
                    {filteredFurniture.map((item) => (
                      <button
                        key={item._id}
                        className="group bg-[#2C2C2C] p-3 rounded-lg hover:bg-[#A58077] hover:scale-105 transition-all duration-200 text-left"
                        onClick={() => addFurnitureToDesign(item)}
                        disabled={loading}
                      >
                        <div className="relative mb-2">
                          <img 
                            src={item.image || item.filePath} 
                            alt={item.name} 
                            className="w-full h-20 object-cover rounded-lg group-hover:brightness-110 transition-all duration-200"
                            onError={(e) => {
                              e.target.src = '/images/placeholder-furniture.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200"></div>
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-[#E5CBBE] group-hover:text-white transition-colors duration-200 truncate">
                            {item.name}
                          </div>
                          <div className="text-[#A58077] group-hover:text-white/80 transition-colors duration-200">
                            ${item.price?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Header */}
          <div className="p-6 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#E5CBBE] mb-2">Design Canvas</h2>
                <p className="text-[#A58077] text-sm">
                  {hasUnsavedChanges 
                    ? `${editHistory.length} changes pending - Click "Generate Design" when ready`
                    : "Make your changes and generate the final design"
                  }
                </p>
                {designData?.prompt && (
                  <p className="text-gray-400 text-xs mt-2 bg-[#2C2C2C] p-2 rounded">
                    <strong>Original:</strong> {designData.prompt}
                  </p>
                )}
              </div>
              
              {/* Panel Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFurniturePanel(!showFurniturePanel)}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    showFurniturePanel 
                      ? 'bg-[#A58077] text-white' 
                      : 'bg-[#2C2C2C] text-[#A58077] hover:text-[#E5CBBE]'
                  }`}
                  title="Toggle Furniture Panel"
                >
                  <FaLayerGroup size={16} />
                </button>
                <button
                  onClick={() => setShowControlsPanel(!showControlsPanel)}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    showControlsPanel 
                      ? 'bg-[#A58077] text-white' 
                      : 'bg-[#2C2C2C] text-[#A58077] hover:text-[#E5CBBE]'
                  }`}
                  title="Toggle Controls Panel"
                >
                  <FaCog size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gradient-to-br from-[#2C2C2C] to-[#1e1e1e] rounded-2xl mx-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#A58077]/5 to-transparent"></div>
            
            <div className="relative h-full flex items-center justify-center p-6">
              <img
                src={originalImage}
                alt="Room Canvas"
                className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
                onError={(e) => {
                  e.target.src = '/images/empty-room.jpg';
                }}
              />
              
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader size={80} />
                    <p className="text-white mt-4 text-lg font-medium">Generating your design...</p>
                    <p className="text-white/80 mt-2 text-sm">This may take a few moments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel - Design Controls */}
        <div className={`w-80 bg-[#1e1e1e] border-l border-[#3C3C3C] transition-all duration-300 flex-shrink-0 ${showControlsPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 flex-shrink-0">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#E5CBBE] flex items-center gap-2">
                  <FaCog />
                  Design Controls
                </h2>
                <button
                  onClick={() => setShowControlsPanel(false)}
                  className="p-2 text-[#A58077] hover:text-[#E5CBBE] hover:bg-[#2C2C2C] rounded-lg transition-all duration-200"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Selected Furniture */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[#A58077] uppercase tracking-wide flex items-center gap-2">
                    <FaPlus />
                    Selected Items ({selectedFurniture.length})
                  </h4>
                  {selectedFurniture.length > 0 && (
                    <button
                      onClick={() => setSelectedFurniture([])}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {selectedFurniture.length === 0 ? (
                  <div className="text-[#A58077] text-sm p-4 bg-[#2C2C2C] rounded-lg text-center">
                    No furniture selected
                  </div>
                ) : (
                  <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar">
                    {selectedFurniture.map((item) => (
                      <div key={item._id} className="flex items-center gap-3 bg-[#2C2C2C] p-3 rounded-lg group hover:bg-[#3C3C3C] transition-all duration-200">
                        <img 
                          src={item.image || item.filePath} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#E5CBBE] truncate">{item.name}</div>
                          <div className="text-xs text-[#A58077]">${item.price?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <button
                          onClick={() => removeFurnitureFromDesign(item._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <FaMinus size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Controls */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 pt-0">
                {/* Style Controls */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-[#A58077] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <FaPalette />
                    Style Settings
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(styleOptions).map(([category, options]) => (
                      <div key={category}>
                        <label className="text-xs text-[#A58077] uppercase tracking-wide mb-2 block">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <select
                          value={styleChanges[category]}
                          onChange={(e) => updateStyle(category, e.target.value)}
                          className="w-full p-3 bg-[#2C2C2C] text-white rounded-lg border border-[#3C3C3C] focus:border-[#A58077] focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-200 text-sm"
                        >
                          {options.map(option => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Controls */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-[#A58077] mb-4 uppercase tracking-wide flex items-center gap-2">
                    <FaPaintBrush />
                    Room Settings
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(roomOptions).map(([category, options]) => (
                      <div key={category}>
                        <label className="text-xs text-[#A58077] uppercase tracking-wide mb-2 block">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </label>
                        <select
                          value={roomChanges[category]}
                          onChange={(e) => updateRoom(category, e.target.value)}
                          className="w-full p-3 bg-[#2C2C2C] text-white rounded-lg border border-[#3C3C3C] focus:border-[#A58077] focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-200 text-sm"
                        >
                          {options.map(option => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pb-6">
                  <button
                    onClick={handleSaveDesign}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  >
                    <FaSave />
                    Save Design
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-[#2C2C2C] text-[#E5CBBE] rounded-lg hover:bg-[#3C3C3C] transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-[#3C3C3C] hover:border-[#A58077]"
                  >
                    <FaDownload />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2C2C2C;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #A58077;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B6B63;
        }
      `}</style>
    </div>
  );
};

export default EditDesignPage;
