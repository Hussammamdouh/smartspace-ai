import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UnifiedChat = () => {
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { role: "user", content: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chatbot/unified`, {
        messages: updatedMessages,
        model: model === "dalle" ? "image" : "chat",
      });

      const responseMsg =
        data.type === "image"
          ? { role: "assistant", content: "", image: data.content }
          : { role: "assistant", content: data.content };

      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SmartSpace AI Chat</h1>
          <div className="flex items-center gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#E5CBBE] text-[#181818] font-semibold px-4 py-2 rounded-md"
            >
              <option value="gpt-3.5-turbo">ChatGPT</option>
              <option value="dalle">Image Generator</option>
            </select>
            <button
              onClick={() => navigate("/edit-design")}
              className="bg-[#A58077] text-white px-4 py-2 rounded hover:opacity-80 transition"
            >
              Edit Design
            </button>
          </div>
        </div>

        <div className="bg-[#2c2c2c] p-4 rounded-lg h-[70vh] overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-[#A58077] text-white ml-auto"
                  : "bg-[#E5CBBE] text-[#181818] mr-auto"
              }`}
            >
              {msg.image ? (
                <img src={msg.image} alt="Generated" className="rounded-lg w-full" />
              ) : (
                msg.content
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-lg bg-[#E5CBBE] text-[#181818] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#A58077] text-white px-6 py-3 rounded-lg hover:opacity-80"
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnifiedChat;
