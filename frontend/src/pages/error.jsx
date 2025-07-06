import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import notFoundAnimation from "../assets/animations/404-animation.json"; // 🛑 You need to import a lottie json here!


const NotFoundPage = () => {
  
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--text)] px-6">
      {/* Lottie animation */}
      <div className="w-72 h-72 mb-6">
        <Lottie animationData={notFoundAnimation} loop={true} />
      </div>

      <h1 className="text-4xl font-extrabold mb-2">Page Not Found</h1>
      <p className="text-[#A09C9C] mb-6 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-[#A58077] text-white rounded-full hover:bg-[#E5CBBE] hover:text-[#181818] transition-all text-lg font-semibold"
      >
        Go Back Home
      </button>

      <div className="absolute bottom-6 text-sm text-[#A09C9C]">
        SmartSpace.AI - {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default NotFoundPage;