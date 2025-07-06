import PropTypes from "prop-types";

const MessageBubble = ({ sender, text, loading = false }) => {
  const isUser = sender === "user";
  const baseStyles = "max-w-[75%] px-4 py-3 rounded-lg shadow text-sm whitespace-pre-wrap";
  const userStyles = "bg-[#A58077] text-white self-end rounded-br-none";
  const botStyles = "bg-[#E5CBBE] text-[#181818] self-start rounded-bl-none";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${baseStyles} ${isUser ? userStyles : botStyles}`}>
        {loading ? <span className="italic">...</span> : text}
      </div>
    </div>
  );
};

MessageBubble.propTypes = {
  sender: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

export default MessageBubble;
