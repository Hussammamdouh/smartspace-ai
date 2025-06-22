import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaPaperPlane, 
  FaSpinner, 
  FaHistory, 
  FaImage, 
  FaComments, 
  FaSave, 
  FaTrash, 
  FaPlus,
  FaPalette,
  FaDownload,
  FaShare
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatMode, setChatMode] = useState('chat'); // 'chat' or 'image'
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [savedDesign, setSavedDesign] = useState(null);
  
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadConversations();
    }
  }, [user, navigate]);

  const loadConversations = async () => {
    // Only load conversations if user is authenticated
    if (!user) {
      console.log('User not authenticated, skipping conversation load');
      return;
    }

    try {
      const response = await axiosInstance.get('/chat/history');
      setConversations(response.data.data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await axiosInstance.post('/chat/conversation', {
        title: conversationTitle
      });
      
      const newConversation = response.data.data;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation._id);
      setMessages([]);
      setConversationTitle('New Conversation');
      toast.success('New conversation started!');
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error('Failed to start new conversation');
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/chat/conversation/${conversationId}`);
      const conversation = response.data.data;
      setMessages(conversation.conversation || []);
      setCurrentConversationId(conversationId);
      setConversationTitle(conversation.title);
      setShowHistory(false);
    } catch (err) {
      console.error('Error loading conversation:', err);
      toast.error('Failed to load conversation');
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axiosInstance.delete(`/chat/conversation/${conversationId}`);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
        setConversationTitle('New Conversation');
      }
      toast.success('Conversation deleted!');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }

    if (newMessage.length > 500) {
      setError("Message is too long (max 500 characters)");
      return;
    }

    if (!currentConversationId) {
      await startNewConversation();
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post("/chat/message", {
        conversationId: currentConversationId,
        message: newMessage,
        model: chatMode
      });

      const newMessages = [
        { role: "user", content: newMessage, type: 'text' },
        { 
          role: "assistant", 
          content: response.data.data.response, 
          type: response.data.data.type,
          imageUrl: response.data.data.type === 'image' ? response.data.data.response : null
        }
      ];

      setMessages(prev => [...prev, ...newMessages]);
      setNewMessage("");
      
      // Reload conversations to get updated list
      loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const saveDesign = async (designData) => {
    try {
      const response = await axiosInstance.post('/design/preferences', {
        roomType: designData.roomType || 'Living Room',
        style: designData.style || 'Modern',
        colorPalette: designData.colors || ['gray', 'white', 'blue'],
        budget: designData.budget || 2000,
        dimensions: designData.dimensions || '5x7 meters',
        additionalNotes: designData.notes || 'AI generated design'
      });
      
      setSavedDesign(response.data.preference);
      setShowSaveOptions(false);
      toast.success('Design preferences saved!');
    } catch (err) {
      console.error('Error saving design:', err);
      toast.error('Failed to save design preferences');
    }
  };

  const generateDesignFromChat = async () => {
    if (!savedDesign) {
      toast.error('Please save design preferences first');
      return;
    }

    try {
      await axiosInstance.post('/design/generate', {
        preferenceId: savedDesign._id
      });
      
      toast.success('Design generation started!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error generating design:', err);
      toast.error('Failed to generate design');
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="flex h-screen">
        {/* History Sidebar */}
        <div className={`w-80 bg-[#2C2C2C] border-r border-[#3C3C3C] transition-all duration-300 ${
          showHistory ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-20 h-full`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chat History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <button
              onClick={startNewConversation}
              className="w-full bg-[#A58077] text-white rounded-lg p-3 mb-4 flex items-center justify-center gap-2 hover:bg-[#8B6B63] transition"
            >
              <FaPlus />
              New Conversation
            </button>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    currentConversationId === conversation._id
                      ? 'bg-[#A58077] text-white'
                      : 'bg-[#3C3C3C] hover:bg-[#4C4C4C]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => loadConversation(conversation._id)}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="font-medium truncate">{conversation.title}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteConversation(conversation._id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-[#2C2C2C] p-4 border-b border-[#3C3C3C]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-gray-400 hover:text-white md:hidden"
                >
                  <FaHistory size={20} />
                </button>
                <h1 className="text-2xl font-bold">AI Interior Design Assistant</h1>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Mode Toggle */}
                <div className="flex bg-[#3C3C3C] rounded-lg p-1">
                  <button
                    onClick={() => setChatMode('chat')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                      chatMode === 'chat' 
                        ? 'bg-[#A58077] text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FaComments />
                    Chat
                  </button>
                  <button
                    onClick={() => setChatMode('image')}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${
                      chatMode === 'image' 
                        ? 'bg-[#A58077] text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FaImage />
                    Generate
                  </button>
                </div>

                {/* Save Options */}
                {chatMode === 'image' && (
                  <button
                    onClick={() => setShowSaveOptions(!showSaveOptions)}
                    className="bg-[#A58077] text-white px-4 py-2 rounded-lg hover:bg-[#8B6B63] transition flex items-center gap-2"
                  >
                    <FaSave />
                    Save Design
                  </button>
                )}
              </div>
            </div>

            {/* Save Options Panel */}
            {showSaveOptions && (
              <div className="mt-4 p-4 bg-[#3C3C3C] rounded-lg">
                <h3 className="font-bold mb-3">Save Design Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Room Type (e.g., Living Room)"
                    className="bg-[#2C2C2C] text-white px-3 py-2 rounded border border-[#4C4C4C] focus:outline-none focus:border-[#A58077]"
                  />
                  <input
                    type="text"
                    placeholder="Style (e.g., Modern)"
                    className="bg-[#2C2C2C] text-white px-3 py-2 rounded border border-[#4C4C4C] focus:outline-none focus:border-[#A58077]"
                  />
                  <input
                    type="text"
                    placeholder="Colors (e.g., gray, white, blue)"
                    className="bg-[#2C2C2C] text-white px-3 py-2 rounded border border-[#4C4C4C] focus:outline-none focus:border-[#A58077]"
                  />
                  <input
                    type="number"
                    placeholder="Budget"
                    className="bg-[#2C2C2C] text-white px-3 py-2 rounded border border-[#4C4C4C] focus:outline-none focus:border-[#A58077]"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => saveDesign({})}
                    className="bg-[#A58077] text-white px-4 py-2 rounded hover:bg-[#8B6B63] transition"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={generateDesignFromChat}
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded hover:bg-[#45a049] transition flex items-center gap-2"
                  >
                    <FaPalette />
                    Generate Design
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <FaComments size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
                <p>Ask about interior design or generate images</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-[#A58077] text-white"
                      : "bg-[#3C3C3C] text-white"
                  }`}
                >
                  {msg.type === 'image' && msg.imageUrl ? (
                    <div>
                      <p className="mb-2">{msg.content}</p>
                      <img 
                        src={msg.imageUrl} 
                        alt="Generated design" 
                        className="rounded-lg max-w-full h-auto"
                      />
                      <div className="flex gap-2 mt-2">
                        <button className="text-sm bg-[#4C4C4C] px-2 py-1 rounded hover:bg-[#5C5C5C] transition flex items-center gap-1">
                          <FaDownload />
                          Download
                        </button>
                        <button className="text-sm bg-[#4C4C4C] px-2 py-1 rounded hover:bg-[#5C5C5C] transition flex items-center gap-1">
                          <FaShare />
                          Share
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#3C3C3C] rounded-lg p-3">
                  <FaSpinner className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#3C3C3C]">
            {error && (
              <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={chatMode === 'chat' ? "Ask about interior design..." : "Describe the design you want to generate..."}
                className="flex-1 bg-[#3C3C3C] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A58077]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#A58077] text-white rounded-lg px-6 py-3 hover:bg-[#8B6B63] transition disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FaPaperPlane />
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
