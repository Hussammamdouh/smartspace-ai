import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
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

// Custom axios instance for image generation with longer timeout
const imageAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 3 minutes timeout for image generation (DALL-E + Cloudinary upload)
});

// Add auth interceptor to image axios instance
imageAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  const [customPrompt, setCustomPrompt] = useState("");
  const [customPromptLoading, setCustomPromptLoading] = useState(false);
  const [customPromptError, setCustomPromptError] = useState("");

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
    // Check authentication status
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    if (!token) {
      console.error('No auth token found, redirecting to login');
      toast.error('Please log in to access the edit design page');
      navigate('/login');
      return;
    }

    // Load design data from localStorage if available
    const savedDesignData = localStorage.getItem('editDesignData');
    if (savedDesignData) {
      try {
        const parsedData = JSON.parse(savedDesignData);
        setDesignData(parsedData);
        console.log('Loaded design data:', parsedData);
        
        if (parsedData.imageUrl) {
          setOriginalImage(parsedData.imageUrl);
          console.log('Setting image URL:', parsedData.imageUrl);
        } else {
          setOriginalImage("/images/empty-room.jpg");
        }
        
        // Update URL with design ID for better persistence
        if (parsedData._id) {
          updateURLWithDesignId(parsedData._id);
        }
        
        // Only clear localStorage after URL is updated
        localStorage.removeItem('editDesignData');
      } catch (error) {
        console.error('Error parsing design data:', error);
        setOriginalImage("/images/empty-room.jpg");
      }
    } else {
      // If no design data, try to load from editDesignData (alternative key)
      const alternativeData = localStorage.getItem('designToEdit');
      if (alternativeData) {
        try {
          const parsedData = JSON.parse(alternativeData);
          setDesignData(parsedData);
          console.log('Loaded alternative design data:', parsedData);
          
          if (parsedData.imageUrl) {
            setOriginalImage(parsedData.imageUrl);
            console.log('Setting alternative image URL:', parsedData.imageUrl);
          } else {
            setOriginalImage("/images/empty-room.jpg");
          }
          
          // Update URL with design ID for better persistence
          if (parsedData._id) {
            updateURLWithDesignId(parsedData._id);
          }
          
          localStorage.removeItem('designToEdit');
        } catch (error) {
          console.error('Error parsing alternative design data:', error);
          setOriginalImage("/images/empty-room.jpg");
        }
      } else {
        // If no design data in localStorage, try to get from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const designId = urlParams.get('id');
        if (designId) {
          console.log('Found design ID in URL:', designId);
          // Check if it's a temporary ID (starts with 'temp-')
          if (designId.startsWith('temp-')) {
            console.log('Temporary design ID detected, skipping backend fetch');
            setOriginalImage("/images/empty-room.jpg");
          } else {
            fetchDesignFromBackend(designId);
          }
        } else {
          // If no design ID, try to get from path params
          const pathParts = window.location.pathname.split('/');
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart !== 'edit-design') {
            console.log('Found design ID in path:', lastPart);
            // Check if it's a temporary ID
            if (lastPart.startsWith('temp-')) {
              console.log('Temporary design ID detected, skipping backend fetch');
              setOriginalImage("/images/empty-room.jpg");
            } else {
              fetchDesignFromBackend(lastPart);
            }
          } else {
            setOriginalImage("/images/empty-room.jpg");
          }
        }
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

  // Function to fetch design data from backend
  const fetchDesignFromBackend = async (designId) => {
    try {
      setLoading(true);
      console.log('Fetching design from backend with ID:', designId);
      
      const response = await axiosInstance.get(`/edit-design/${designId}`);
      console.log('Backend response:', response.data);
      
      if (response.data.success && response.data.data) {
        const design = response.data.data;
        setDesignData(design);
        
        if (design.imageUrl) {
          setOriginalImage(design.imageUrl);
          console.log('Fetched design from backend:', design);
          console.log('Setting image URL:', design.imageUrl);
        } else {
          console.log('No image URL in design data');
          setOriginalImage("/images/empty-room.jpg");
        }
        
        // Persist the fetched design data
        localStorage.setItem('editDesignData', JSON.stringify(design));
        console.log('Persisted design data to localStorage');
        
        // Update URL to include design ID for better persistence
        updateURLWithDesignId(designId);
      } else {
        console.error('Failed to fetch design from backend - no success or data');
        setOriginalImage("/images/empty-room.jpg");
        toast.error('Failed to load design data');
      }
    } catch (error) {
      console.error('Error fetching design from backend:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setOriginalImage("/images/empty-room.jpg");
      toast.error('Failed to load design data');
    } finally {
      setLoading(false);
    }
  };

  // Function to update URL with design ID
  const updateURLWithDesignId = (designId) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('id', designId);
    window.history.replaceState({}, '', currentUrl.toString());
  };

  // Track changes for unsaved changes indicator
  useEffect(() => {
    const hasChanges = selectedFurniture.length > 0 || 
                      removedFurniture.length > 0 || 
                      editHistory.length > 0;
    setHasUnsavedChanges(hasChanges);
  }, [selectedFurniture, removedFurniture, editHistory]);

  // Handle page refresh - check for design ID in URL and fetch latest data
  useEffect(() => {
    const handlePageRefresh = () => {
      // Check if we have a design ID in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const designId = urlParams.get('id');
      
      if (designId && designData?._id === designId) {
        // If we have the same design ID, fetch the latest data from backend
        fetchDesignFromBackend(designId);
      } else if (designId && !designData) {
        // If we have a design ID but no design data, fetch it
        fetchDesignFromBackend(designId);
      }
    };

    // Check on mount and when designData changes
    handlePageRefresh();
  }, [designData?._id]);

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

      // Show loading toast for image generation
      toast.loading('Applying furniture to white background... This may take 30-60 seconds.', {
        duration: 60000, // 1 minute
        id: 'design-generation'
      });

      // Build comprehensive prompt for white background approach
      const furnitureList = selectedFurniture.map(item => item.name).join(', ');
      
      let prompt = `Apply the following furniture to a white background:\n\n`;
      
      if (selectedFurniture.length > 0) {
        prompt += `FURNITURE ITEMS TO APPLY: ${furnitureList}\n`;
      }
      
      prompt += `\nWHITE BACKGROUND REQUIREMENTS:\n`;
      prompt += `- Use a clean white background\n`;
      prompt += `- Maintain consistent furniture positioning\n`;
      prompt += `- Fixed layout that never changes\n`;
      prompt += `- Professional furniture placement\n`;
      
      prompt += `\nStyle context (for furniture selection):\n`;
      prompt += `- Design style: ${styleChanges.style}\n`;
      prompt += `- Color scheme: ${styleChanges.colorScheme}\n`;
      prompt += `- Lighting: ${styleChanges.lighting}\n`;
      prompt += `- Mood: ${styleChanges.mood}\n`;
      
      prompt += `\nRoom context:\n`;
      prompt += `- Layout: ${roomChanges.layout}\n`;
      prompt += `- Size: ${roomChanges.size}\n`;
      prompt += `- Windows: ${roomChanges.windows}\n`;
      
      prompt += `\nQuality requirements:\n`;
      prompt += `- Clean white background\n`;
      prompt += `- Professional furniture placement\n`;
      prompt += `- Consistent layout positioning\n`;
      prompt += `- High-quality furniture images`;

      // If we have a design ID (and it's not temporary), use the edit design endpoint
      if (designData?._id && !designData._id.startsWith('temp-')) {
        const response = await imageAxiosInstance.post(`/edit-design/${designData._id}/edit`, {
          action: 'add',
          furnitureItems: selectedFurniture.map(item => item._id),
          prompt: prompt.trim(),
          originalImageUrl: originalImage,
          useWhiteBackground: true
        });
        
        if (response.data.success) {
          const newImageUrl = response.data.data.newImageUrl;
          const updatedDesign = response.data.data.editedDesign;
          
          // Update both the image and the design data
          setOriginalImage(newImageUrl);
          setDesignData(updatedDesign);
          
          // Persist the updated design data
          localStorage.setItem('editDesignData', JSON.stringify(updatedDesign));
          
          // Update URL with design ID for better persistence
          if (updatedDesign._id) {
            updateURLWithDesignId(updatedDesign._id);
          }
          
          // Clear all changes after successful generation
          setSelectedFurniture([]);
          setRemovedFurniture([]);
          setEditHistory([]);
          setHasUnsavedChanges(false);
          
          toast.success('Design updated with white background!');
        } else {
          throw new Error(response.data.message || "Failed to edit design");
        }
      } else {
        // For temporary designs, create a new design using the white background service
        const response = await imageAxiosInstance.post('/ai/generate-image', {
          prompt: prompt.trim(),
          style: styleChanges.style,
          size: '1024x1024',
          useWhiteBackground: true,
          furnitureItems: selectedFurniture.map(item => item._id)
        });
        
        if (response.data.status === 'success') {
          const newImageUrl = response.data.data.imageUrl;
          
          // Update the image
          setOriginalImage(newImageUrl);
          
          // Update design data
          const updatedDesignData = {
            ...designData,
            imageUrl: newImageUrl,
            _id: response.data.data.designId || `temp-${Date.now()}`
          };
          setDesignData(updatedDesignData);
          
          // Clear all changes after successful generation
          setSelectedFurniture([]);
          setRemovedFurniture([]);
          setEditHistory([]);
          setHasUnsavedChanges(false);
          
          toast.success('Design created with white background!');
        } else {
          throw new Error(response.data.message || "Failed to create design");
        }
      }
      
      // Dismiss loading toast on success
      toast.dismiss('design-generation');
    } catch (err) {
      console.error('Error generating design:', err);
      
      if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        toast.error("Please log in again to continue.");
        // Redirect to login
        navigate('/login');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Image generation is taking longer than expected. Please try again.");
        toast.error("Image generation timed out. Please try again.");
      } else if (err.response?.status === 429) {
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
      
      // Dismiss loading toast on error
      toast.dismiss('design-generation');
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new design
  const createNewDesign = async (prompt, style) => {
    try {
      const response = await imageAxiosInstance.post('/ai/generate-image', { 
        prompt: prompt.trim(),
        style: style,
        size: '1024x1024'
      });
      
      if (response.data.status === 'success') {
        const newImageUrl = response.data.data.imageUrl;
        const newDesignData = {
          imageUrl: newImageUrl,
          prompt: prompt,
          style: style,
          timestamp: new Date().toISOString(),
          _id: response.data.data.designId || `temp-${Date.now()}`
        };
        
        setOriginalImage(newImageUrl);
        setDesignData(newDesignData);
        localStorage.setItem('editDesignData', JSON.stringify(newDesignData));
        
        return newDesignData;
      } else {
        throw new Error(response.data.message || "Failed to generate design");
      }
    } catch (error) {
      console.error('Error creating new design:', error);
      throw error;
    }
  };

  const handleSaveDesign = async () => {
    try {
      if (!designData?._id) {
        toast.error('No design to save');
        return;
      }

      // Save design edit preferences using the edit design endpoint
      await axiosInstance.post(`/edit-design/${designData._id}/preferences`, {
        furniturePreferences: selectedFurniture.map(item => item._id),
        stylePreferences: styleChanges,
        colorPreferences: { colorScheme: styleChanges.colorScheme },
        notes: 'AI edited design with custom specifications'
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

  // Handler for custom prompt
  const handleCustomPromptSubmit = async (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    try {
      setCustomPromptLoading(true);
      setCustomPromptError("");
      setLoading(true); // show loader on image
      
      // Show loading toast for image generation
      toast.loading('Generating your design... This may take 2-3 minutes.', {
        duration: 180000, // 3 minutes
        id: 'custom-prompt-generation'
      });
      
      // For custom prompts, we need to handle existing designs differently
      let enhancedPrompt = customPrompt.trim();
      
      // If we have an existing design, use the custom prompt endpoint
      if (designData?._id && originalImage !== "/images/empty-room.jpg") {
        // Use the new custom prompt endpoint that doesn't require furniture items
        const response = await imageAxiosInstance.post(`/edit-design/${designData._id}/custom-prompt`, {
          prompt: enhancedPrompt,
          originalImageUrl: originalImage,
          useWhiteBackground: true
        });
        
        if (response.data.success) {
          const newImageUrl = response.data.data.newImageUrl;
          const updatedDesign = response.data.data.editedDesign;
          
          // Update both the image and the design data
          setOriginalImage(newImageUrl);
          setDesignData(updatedDesign);
          
          // Persist the updated design data
          localStorage.setItem('editDesignData', JSON.stringify(updatedDesign));
          
          // Update URL with design ID for better persistence
          if (updatedDesign._id) {
            updateURLWithDesignId(updatedDesign._id);
          }
          
          toast.success('Design edited from your prompt!');
          setCustomPrompt("");
          return; // Exit early
        } else {
          throw new Error(response.data.message || "Failed to edit design");
        }
      }
      
      // For new designs or when no existing design, use the AI generation endpoint
      const response = await imageAxiosInstance.post('/ai/generate-image', { 
        prompt: enhancedPrompt,
        style: styleChanges.style,
        size: '1024x1024'
      });
      
      if (response.data.status === 'success') {
        const newImageUrl = response.data.data.imageUrl;
        const newDesignData = {
          imageUrl: newImageUrl,
          prompt: enhancedPrompt,
          style: styleChanges.style,
          timestamp: new Date().toISOString(),
          _id: response.data.data.designId || `temp-${Date.now()}`
        };
        
        // Update both the image and the design data
        setOriginalImage(newImageUrl);
        setDesignData(newDesignData);
        
        // Persist the updated design data
        localStorage.setItem('editDesignData', JSON.stringify(newDesignData));
        
        // Update URL with design ID for better persistence
        if (newDesignData._id) {
          updateURLWithDesignId(newDesignData._id);
        }
        
        toast.success('Design generated from your prompt!');
        setCustomPrompt("");
      } else {
        throw new Error(response.data.message || "Failed to generate design");
      }
      
      // Dismiss loading toast on success
      toast.dismiss('custom-prompt-generation');
    } catch (err) {
      console.error('Error generating design from prompt:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setCustomPromptError("Authentication required. Please log in again.");
        toast.error("Please log in again to continue.");
        navigate('/login');
      } else if (err.response?.status === 400) {
        setCustomPromptError("Invalid prompt. Please try a different description.");
        toast.error("Invalid prompt. Please try a different description.");
      } else if (err.response?.status === 429) {
        setCustomPromptError("Rate limit exceeded. Please wait before trying again.");
        toast.error("Too many requests. Please wait before trying again.");
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setCustomPromptError("Image generation timed out. Please try again.");
        toast.error("Image generation timed out. Please try again.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        setCustomPromptError("Network error. Please check your connection and try again.");
        toast.error("Network error. Please check your connection and try again.");
      } else {
        setCustomPromptError("Failed to generate design from prompt.");
        toast.error("Failed to generate design from prompt.");
      }
      
      // Dismiss loading toast on error
      toast.dismiss('custom-prompt-generation');
    } finally {
      setCustomPromptLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] text-[#E5CBBE] flex flex-col overflow-hidden pb-32">
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
                onClick={handleDownload}
                disabled={originalImage === "/images/empty-room.jpg"}
                className="px-4 py-2 bg-[#2C2C2C] text-[#A58077] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Action Button for Generate Design */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={generateFinalDesign}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-full hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            {loading ? (
              <>
                <Loader size={20} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FaMagic size={20} />
                <span>Update Furniture</span>
              </>
            )}
          </button>
        </div>
      )}

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
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-3 py-1 bg-white text-gray-800 rounded-full text-xs font-medium">
                    🎨 White Background
                  </div>
                  <div className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-xs font-medium">
                    📐 Fixed Layout
                  </div>
                </div>
                <p className="text-[#A58077] text-sm">
                  {hasUnsavedChanges 
                    ? `${editHistory.length} furniture changes pending - Layout will never change`
                    : "Add or remove furniture - Layout will never change"
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
            <div className="relative h-full flex flex-col items-center justify-center p-6">
              <img
                src={originalImage}
                alt="Room Canvas"
                className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
                onError={(e) => {
                  e.target.src = '/images/empty-room.jpg';
                }}
              />
              {/* Custom Prompt Input */}
              <form onSubmit={handleCustomPromptSubmit} className="w-full max-w-xl mt-8 flex flex-col gap-2 bg-[#232323] p-4 rounded-lg shadow-lg border border-[#3C3C3C]">
                <label htmlFor="customPrompt" className="text-[#A58077] text-sm font-medium mb-1">Custom furniture edit prompt (white background):</label>
                <textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="Describe furniture changes you want to make (white background with fixed layout)..."
                  className="w-full p-3 bg-[#2C2C2C] text-white rounded-lg border border-[#3C3C3C] focus:border-[#A58077] focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-200 text-sm resize-none"
                  disabled={customPromptLoading || loading}
                />
                {customPromptError && <div className="text-red-400 text-xs">{customPromptError}</div>}
                <button
                  type="submit"
                  disabled={customPromptLoading || loading || !customPrompt.trim()}
                  className="self-end px-6 py-2 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {customPromptLoading || loading ? 'Sending...' : 'Send Prompt'}
                </button>
              </form>
              {/* End Custom Prompt Input */}
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
