import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/animations/success-animation.json"; // 🛑 You need a success lottie JSON!

const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] flex flex-col items-center justify-center px-6 text-center">
      
      {/* Lottie Success Animation */}
      <div className="w-60 h-60 mb-8">
        <Lottie animationData={successAnimation} loop={false} />
      </div>

      <h1 className="text-5xl font-bold mb-4">Thank You!</h1>
      <p className="text-lg text-[#A09C9C] mb-8 max-w-md">
        Your order has been placed successfully. Our team will contact you soon!
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 bg-[#A58077] text-white rounded-full hover:bg-[#E5CBBE] hover:text-[#181818] transition-all text-lg font-semibold"
        >
          Shop More
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-transparent border border-[#A58077] text-[#A58077] rounded-full hover:bg-[#A58077] hover:text-white transition-all text-lg font-semibold"
        >
          Home
        </button>
      </div>

      <div className="absolute bottom-6 text-sm text-[#A09C9C]">
        SmartSpace.AI - {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ThankYouPage;
