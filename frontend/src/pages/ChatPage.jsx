import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
    }
  }, [user, navigate]);

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

    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post("/api/chat", {
        message: newMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "user", content: newMessage },
        { role: "assistant", content: response.data.message },
      ]);

      setNewMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">AI Interior Design Assistant</h1>
        
        <div className="bg-[#2C2C2C] rounded-lg p-4 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                  {msg.content}
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

          {error && (
            <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about interior design..."
              className="flex-1 bg-[#3C3C3C] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A58077]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#A58077] text-white rounded-lg px-4 py-2 hover:bg-[#8B6B63] transition disabled:opacity-50"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
