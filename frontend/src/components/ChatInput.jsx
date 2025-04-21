import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-[#A58077] flex gap-3 bg-[#181818]">
      <input
        className="flex-1 px-4 py-3 rounded-lg bg-[#E5CBBE] text-[#181818] placeholder:text-[#888] outline-none focus:ring-2 ring-[#A58077]"
        placeholder="Describe your room or ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="submit"
        className="bg-[#A58077] text-white px-4 py-3 rounded-lg hover:opacity-90 transition"
      >
        <FiSend size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
