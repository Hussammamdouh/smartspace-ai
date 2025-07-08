import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";


const ThankYouPage = () => {
  
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col items-center justify-center px-6 text-center">
      
      {/* Success Icon */}
      <div className="w-60 h-60 mb-8 flex items-center justify-center">
        <FaCheckCircle className="text-green-400 text-8xl animate-pulse" />
      </div>

      <h1 className="text-5xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="text-lg text-[#A09C9C] mb-8 max-w-md">
        Your order has been placed successfully. We appreciate your trust in SmartSpace.AI. You will receive a confirmation email soon. If you have any questions, feel free to contact our support team.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 bg-[#A58077] text-white rounded-full hover:bg-[#E5CBBE] hover:text-[#181818] transition-all text-lg font-semibold"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-transparent border border-[#A58077] text-[#A58077] rounded-full hover:bg-[#A58077] hover:text-white transition-all text-lg font-semibold"
        >
          Go to Home
        </button>
      </div>

      <div className="absolute bottom-6 text-sm text-[#A09C9C]">
        SmartSpace.AI - {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ThankYouPage;
