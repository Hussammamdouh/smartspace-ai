import { useState, useEffect, useRef } from "react";
import { 
  FaComments, 
  FaImage, 
  FaPaperPlane, 
  FaSpinner, 
  FaDownload, 
  FaShare, 
  FaEdit, 
  FaShoppingCart,
  FaPlus,
  FaTrash,
  FaUser,
  FaRobot,
  FaMagic,
  FaLightbulb
} from "react-icons/fa";
import PropTypes from "prop-types";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [chatMode, setChatMode] = useState('chat'); // 'chat' or 'image'
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await axiosInstance.get('/chat/history');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await axiosInstance.post('/chat/conversation', {
        title: 'New Conversation'
      });
      setCurrentConversationId(response.data.data._id);
      setMessages([]);
      loadConversations();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/chat/conversation/${conversationId}`);
      const conversation = response.data.data.conversation || [];
      
      console.log('Loaded conversation messages:', conversation);
      setMessages(conversation);
      setCurrentConversationId(conversationId);
      setChatMode(response.data.data.type || 'chat');
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axiosInstance.delete(`/chat/conversation/${conversationId}`);
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      loadConversations();
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = { role: "user", content: newMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    setError("");

    // Set specific loading state for image generation
    if (chatMode === 'image') {
      setIsGeneratingImage(true);
      toast.loading('Generating your design... This may take up to 2-3 minutes.', {
        duration: 180000, // 3 minutes
        id: 'image-generation'
      });
    }

    try {
      // If no conversation exists, create one first
      let conversationId = currentConversationId;
      if (!conversationId) {
        const newConvResponse = await axiosInstance.post('/chat/conversation', {
          title: 'New Conversation'
        });
        conversationId = newConvResponse.data.data._id;
        setCurrentConversationId(conversationId);
      }

      let response;
      if (chatMode === 'chat') {
        response = await axiosInstance.post("/chat/message", {
          conversationId: conversationId,
          message: newMessage,
          model: 'chat'
        });
      } else {
        // Image generation mode
        response = await imageAxiosInstance.post("/chat/message", {
          conversationId: conversationId,
          message: newMessage,
          model: 'image'
        });
      }

      if (response.data.status === 'success') {
        console.log('Response data:', response.data);
        console.log('Response data.data:', response.data.data);
        console.log('Response data.data.response:', response.data.data.response);
        
        let assistantMessage;
        
        if (chatMode === 'image') {
          // For image generation, the response contains the image URL
          console.log('Creating image message with URL:', response.data.data.response);
          console.log('Design data from response:', response.data.data.designData);
          console.log('Full response data:', response.data.data);
          
          assistantMessage = {
            role: "assistant",
            content: `Generated interior design image based on: ${newMessage}`,
            timestamp: new Date(),
            type: 'image',
            imageUrl: response.data.data.response, // The imageUrl is in response field
            designData: response.data.data.designData
          };
          console.log('Image message created:', assistantMessage);
          console.log('Image URL in message:', assistantMessage.imageUrl);
          console.log('Design data in message:', assistantMessage.designData);
        } else {
          // For chat, the response contains the text message
          assistantMessage = {
            role: "assistant",
            content: response.data.data.response,
            timestamp: new Date(),
            type: 'text'
          };
        }
        
        console.log('Adding message to state:', assistantMessage);
        setMessages(prev => [...prev, assistantMessage]);
        
        // Reload conversations to show the new one
        loadConversations();
        
        // Dismiss loading toast and show success
        if (chatMode === 'image') {
          toast.dismiss('image-generation');
          toast.success('Design generated successfully!');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More specific error messages
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Request timed out:', error.message);
        setError("Image generation is taking longer than expected. Please try again.");
        toast.error("Image generation timed out. Please try again.");
      } else if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.message || "Failed to send message. Please try again.");
        toast.error(error.response.data.message || "Failed to send message");
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError("No response from server. Please check your connection.");
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error('Error setting up request:', error.message);
        setError("Failed to send message. Please try again.");
        toast.error("Failed to send message");
      }
      
      // Dismiss loading toast on error
      if (chatMode === 'image') {
        toast.dismiss('image-generation');
      }
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = async (imageUrl, designName = 'generated-design') => {
    try {
      console.log('Downloading image:', imageUrl);
      const response = await axiosInstance.post('/design/download-image', {
        imageUrl: imageUrl,
        filename: `${designName}-${Date.now()}.png`
      }, {
        responseType: 'blob'
      });
      
      console.log('Download response:', response);
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${designName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to download image');
    }
  };

  const shareImage = async (imageUrl, designName = 'Generated Design') => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: designName,
          text: 'Check out this AI-generated interior design!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      toast.error('Failed to share image');
    }
  };

  const editDesign = (imageUrl, messageContent, designData = null) => {
    console.log('editDesign called with:', { imageUrl, messageContent, designData });
    
    const editData = {
      imageUrl,
      prompt: messageContent,
      timestamp: new Date().toISOString()
    };
    
    // If we have design data from the message, use it
    if (designData && designData.designId) {
      editData._id = designData.designId;
      editData.style = designData.metadata?.style || 'modern';
      editData.roomType = designData.metadata?.roomType || 'living room';
      editData.totalCost = designData.totalCost;
      editData.furnitureCount = designData.furnitureCount;
      editData.usedItems = designData.usedItems;
      console.log('Using design data from message:', designData);
    } else {
      console.log('No design data available, using basic data');
    }
    
    console.log('Final edit data to be stored:', editData);
    localStorage.setItem('editDesignData', JSON.stringify(editData));
    
    // Navigate with design ID if available, otherwise just to edit-design
    if (editData._id) {
      console.log('Navigating with design ID:', editData._id);
      navigate(`/edit-design?id=${editData._id}`);
    } else {
      console.log('Navigating without design ID');
      navigate('/edit-design');
    }
  };

  const purchaseDesign = async (imageUrl, messageContent) => {
    try {
      console.log('Extracting items for:', { imageUrl, messageContent });
      const response = await axiosInstance.post('/design/extract-items', {
        imageUrl: imageUrl,
        prompt: messageContent
      });
      
      console.log('Extract items response:', response.data);
      
      if (response.data.status === 'success' && response.data.data.items && response.data.data.items.length > 0) {
        response.data.data.items.forEach(item => {
          addToCart(item);
        });
        toast.success(`${response.data.data.items.length} items added to cart!`);
      } else {
        toast.info('No specific items found in this design');
      }
    } catch (error) {
      console.error('Error extracting items:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to extract items from design');
    }
  };

  const quickPrompts = [
    "Design a modern living room with neutral colors",
    "Create a cozy bedroom with warm lighting",
    "Show me a minimalist kitchen design",
    "Design a luxurious bathroom with marble accents",
    "Create a Scandinavian-style dining room"
  ];

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] text-[#E5CBBE] overflow-hidden pt-16 lg:pt-20">
      <div className="h-full flex flex-col">
        
        {/* Header */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-[#2a2a2a] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center shadow-lg">
                <FaComments className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AI Design
                  <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Studio</span>
                </h1>
                <p className="text-[#A58077] text-sm">Your personal AI design assistant</p>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-[#2a2a2a] rounded-xl p-1">
              <button
                onClick={() => setChatMode('chat')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  chatMode === 'chat' 
                    ? 'bg-[#A58077] text-white shadow-lg' 
                    : 'text-[#A58077] hover:text-white hover:bg-[#3a3a3a]'
                }`}
              >
                <FaComments className="text-sm" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setChatMode('image')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  chatMode === 'image' 
                    ? 'bg-[#A58077] text-white shadow-lg' 
                    : 'text-[#A58077] hover:text-white hover:bg-[#3a3a3a]'
                }`}
              >
                <FaImage className="text-sm" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          
          {/* Sidebar - Conversations */}
          <div className="w-80 bg-[#1a1a1a]/60 backdrop-blur-sm border-r border-[#2a2a2a] flex flex-col">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Conversations</h2>
                <button
                  onClick={startNewConversation}
                  className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaPlus className="text-sm" />
                </button>
              </div>
              
              <div className="text-xs text-[#A58077] bg-[#2a2a2a] rounded-lg p-2">
                {chatMode === 'chat' 
                  ? "💬 Ask questions and get design advice"
                  : "🎨 Generate stunning interior designs"
                }
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-2xl text-[#A58077]" />
                  </div>
                  <h3 className="text-white font-medium mb-2">No conversations yet</h3>
                  <p className="text-[#A58077] text-sm">Start a new chat to begin your design journey</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                      currentConversationId === conversation._id
                        ? 'bg-[#A58077] text-white shadow-lg'
                        : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#E5CBBE] hover:text-white'
                    }`}
                    onClick={() => loadConversation(conversation._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {conversation.title || 'New Conversation'}
                        </p>
                        <p className="text-xs opacity-70 truncate mt-1">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all duration-300"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#0f0f0f]">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentConversationId ? 'Current Conversation' : 'New Conversation'}
                  </h3>
                  <p className="text-[#A58077] text-sm">
                    {chatMode === 'chat' ? 'AI Design Assistant' : 'White Background Generator'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {chatMode === 'image' && (
                    <div className="flex items-center space-x-2 bg-[#A58077]/20 text-[#A58077] px-3 py-1 rounded-full text-sm">
                      <FaMagic className="text-xs" />
                      <span>White Background Mode</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a]">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <div className="text-4xl">🤖</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Welcome to AI Design Studio
                  </h3>
                  <p className="text-[#A58077] mb-8 max-w-md mx-auto text-lg leading-relaxed">
                    {chatMode === 'chat' 
                      ? "Ask me anything about interior design, get personalized advice, or discuss your design ideas."
                      : "Describe the room you want to design and I'll generate a stunning interior for you."
                    }
                  </p>
                  
                  {/* Quick Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setNewMessage(prompt)}
                        className="p-4 bg-[#2a2a2a] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 text-left border border-[#3a3a3a] hover:border-[#A58077] group"
                      >
                        <FaLightbulb className="inline mr-2 text-[#A58077] group-hover:text-white transition-colors" />
                        <span className="text-sm">{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    onDownload={downloadImage}
                    onShare={shareImage}
                    onEdit={editDesign}
                    onPurchase={purchaseDesign}
                  />
                ))
              )}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center space-x-4 p-4 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] shadow-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-full flex items-center justify-center shadow-lg">
                    <FaRobot className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">AI is thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                    {isGeneratingImage && (
                      <div className="mt-2">
                        <p className="text-[#A58077] text-sm mb-2">
                          🎨 Generating your design... This may take 2-3 minutes
                        </p>
                        <div className="w-full bg-[#3a3a3a] rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                        <p className="text-[#A58077] text-xs mt-1">
                          Step 1: Creating design with AI... ⏳
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#1a1a1a]/80 backdrop-blur-sm border-t border-[#2a2a2a]">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={chatMode === 'chat' 
                      ? "Ask about interior design, get advice, or discuss ideas..." 
                      : "Describe the room you want to design..."
                    }
                    className="w-full px-4 py-3 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300 placeholder-[#A58077] text-sm"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  <span>Send</span>
                </button>
              </form>
              
              {error && (
                <p className="text-red-400 text-sm mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, onDownload, onShare, onEdit, onPurchase }) => {
  const isUser = message.role === 'user';
  const isImage = message.type === 'image';

  // Debug logging
  console.log('MessageBubble render:', { 
    message, 
    isImage, 
    imageUrl: message.imageUrl,
    messageType: message.type,
    hasImageUrl: !!message.imageUrl
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser 
            ? 'bg-gradient-to-br from-[#A58077] to-[#8B6B63]' 
            : 'bg-gradient-to-br from-[#2a2a2a] to-[#3a3a3a] border border-[#4a4a4a]'
        }`}>
          {isUser ? (
            <FaUser className="text-white text-sm" />
          ) : (
            <FaRobot className="text-[#A58077] text-sm" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-2xl shadow-lg ${
            isUser 
              ? 'bg-gradient-to-br from-[#A58077] to-[#8B6B63] text-white' 
              : 'bg-[#2a2a2a] text-[#E5CBBE] border border-[#3a3a3a]'
          }`}>
            
            {/* Text Content */}
            {message.content && (
              <div className="mb-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
            )}

            {/* Image Content - Fixed Size Container */}
            {isImage && message.imageUrl && (
              <div className="mb-3">
                <div className="relative group w-80 h-60 bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#3a3a3a] shadow-xl">
                  <img
                    src={message.imageUrl}
                    alt="Generated design"
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Image loaded successfully:', message.imageUrl)}
                    onError={(e) => {
                      console.error('Image failed to load:', message.imageUrl, e);
                      e.target.src = 'https://via.placeholder.com/320x240/2C2C2C/A58077?text=Generated+Design';
                    }}
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownload(message.imageUrl, 'design')}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Download"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                      <button
                        onClick={() => onShare(message.imageUrl)}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Share"
                      >
                        <FaShare className="text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          console.log('Edit button clicked with message:', message);
                          console.log('Message designData:', message.designData);
                          onEdit(message.imageUrl, message.content, message.designData);
                        }}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Edit Design"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => onPurchase(message.imageUrl, message.content)}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Purchase Items"
                      >
                        <FaShoppingCart className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug info for image messages */}
            {isImage && !message.imageUrl && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                Debug: Image message but no imageUrl found. Message: {JSON.stringify(message)}
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-xs opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
  onDownload: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onPurchase: PropTypes.func.isRequired,
};

export default ChatPage;