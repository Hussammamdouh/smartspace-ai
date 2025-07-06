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
  timeout: 60000, // 60 second timeout for image generation
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
      setMessages(response.data.data.conversation || []);
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
        const assistantMessage = {
          role: "assistant",
          content: response.data.data.message,
          timestamp: new Date(),
          type: chatMode === 'image' ? 'image' : 'text',
          imageUrl: response.data.data.imageUrl
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Reload conversations to show the new one
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError("Failed to send message. Please try again.");
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = async (imageUrl, designName = 'generated-design') => {
    try {
      const response = await axiosInstance.get(`/design/download-image?url=${encodeURIComponent(imageUrl)}`, {
        responseType: 'blob'
      });
      
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

  const editDesign = (imageUrl, messageContent) => {
    const designData = {
      imageUrl,
      prompt: messageContent,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('editDesignData', JSON.stringify(designData));
    navigate('/edit-design');
  };

  const purchaseDesign = async (imageUrl, messageContent) => {
    try {
      const response = await axiosInstance.post('/design/extract-items', {
        prompt: messageContent
      });
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        response.data.data.forEach(item => {
          addToCart(item);
        });
        toast.success(`${response.data.data.length} items added to cart!`);
      } else {
        toast.info('No specific items found in this design');
      }
    } catch (error) {
      console.error('Error extracting items:', error);
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
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">AI Chat</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            AI Design
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Assistant</span>
          </h1>
          <p className="text-[#A58077] text-lg">
            Get personalized design advice and generate stunning interiors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <div className="bg-[#2C2C2C] rounded-xl border border-[#3C3C3C] h-full flex flex-col">
              
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#3C3C3C]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#E5CBBE]">Conversations</h2>
                  <button
                    onClick={startNewConversation}
                    className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex bg-[#1e1e1e] rounded-lg p-1">
                  <button
                    onClick={() => setChatMode('chat')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                      chatMode === 'chat' 
                        ? 'bg-[#A58077] text-white' 
                        : 'text-[#A58077] hover:text-[#E5CBBE]'
                    }`}
                  >
                    <FaComments className="inline mr-1" />
                    Chat
                  </button>
                  <button
                    onClick={() => setChatMode('image')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                      chatMode === 'image' 
                        ? 'bg-[#A58077] text-white' 
                        : 'text-[#A58077] hover:text-[#E5CBBE]'
                    }`}
                  >
                    <FaImage className="inline mr-1" />
                    Generate
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="text-4xl text-[#A58077] mx-auto mb-4" />
                    <p className="text-[#A58077] text-sm">No conversations yet</p>
                    <p className="text-[#A58077] text-xs">Start a new chat to begin</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 group ${
                        currentConversationId === conversation._id
                          ? 'bg-[#A58077] text-white'
                          : 'bg-[#1e1e1e] hover:bg-[#3C3C3C] text-[#E5CBBE]'
                      }`}
                      onClick={() => loadConversation(conversation._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conversation.title || 'New Conversation'}
                          </p>
                          <p className="text-xs opacity-70 truncate">
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
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#2C2C2C] rounded-xl border border-[#3C3C3C] h-full flex flex-col">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-[#3C3C3C]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#E5CBBE]">
                      {currentConversationId ? 'Current Conversation' : 'New Conversation'}
                    </h3>
                    <p className="text-sm text-[#A58077]">
                      {chatMode === 'chat' ? 'AI Design Assistant' : 'AI Image Generator'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {chatMode === 'image' && (
                      <div className="flex items-center space-x-1 text-[#A58077] text-sm">
                        <FaMagic />
                        <span>Image Mode</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-[#E5CBBE] mb-2">
                      Welcome to AI Design Assistant
                    </h3>
                    <p className="text-[#A58077] mb-6 max-w-md mx-auto">
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
                          className="p-3 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 text-left text-sm border border-[#3C3C3C] hover:border-[#A58077]"
                        >
                          <FaLightbulb className="inline mr-2 text-[#A58077]" />
                          {prompt}
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
                  <div className="flex items-center space-x-3 p-4 bg-[#1e1e1e] rounded-lg">
                    <div className="w-8 h-8 bg-[#A58077] rounded-full flex items-center justify-center">
                      <FaRobot className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[#E5CBBE]">AI is thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#A58077] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                      {isGeneratingImage && (
                        <p className="text-sm text-[#A58077] mt-1">
                          Generating your design... This may take a moment
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#3C3C3C]">
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
                      className="w-full px-4 py-3 bg-[#1e1e1e] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300 placeholder-[#A58077]"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
                
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-[#A58077]' : 'bg-[#8B6B63]'
        }`}>
          {isUser ? <FaUser className="text-white text-sm" /> : <FaRobot className="text-white text-sm" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block p-4 rounded-2xl ${
            isUser 
              ? 'bg-[#A58077] text-white' 
              : 'bg-[#1e1e1e] text-[#E5CBBE] border border-[#3C3C3C]'
          }`}>
            
            {/* Text Content */}
            {message.content && (
              <div className="mb-3">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}

            {/* Image Content */}
            {isImage && message.imageUrl && (
              <div className="mb-3">
                <div className="relative group">
                  <img
                    src={message.imageUrl}
                    alt="Generated design"
                    className="w-full max-w-md rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/2C2C2C/A58077?text=Generated+Design';
                    }}
                  />
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownload(message.imageUrl, 'design')}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Download"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => onShare(message.imageUrl)}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Share"
                      >
                        <FaShare />
                      </button>
                      <button
                        onClick={() => onEdit(message.imageUrl, message.content)}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Edit Design"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onPurchase(message.imageUrl, message.content)}
                        className="p-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors duration-200"
                        title="Purchase Items"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
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
