import { Link } from "react-router-dom";
import { FaMagic, FaArrowRight, FaBolt, FaRobot } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const AISection = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className={`relative border-2 rounded-3xl p-8 lg:p-12 overflow-hidden transition-all duration-500 transform hover:scale-[1.01] ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] border-[#A58077]/30'
            : 'bg-gradient-to-br from-white via-[#FAF7F3] to-white border-[#8B6B61]/30 shadow-2xl'
        }`}>
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#A58077]/20 to-[#8B6B63]/20'
                : 'bg-gradient-to-br from-[#8B6B61]/10 to-[#A58077]/10'
            }`}></div>
            <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#8B6B63]/20 to-[#A58077]/20'
                : 'bg-gradient-to-br from-[#A58077]/10 to-[#8B6B61]/10'
            }`}></div>
            <div className={`absolute inset-0 bg-[size:40px_40px] transition-opacity duration-500 ${
              isDarkMode
                ? 'bg-[linear-gradient(rgba(165,128,119,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.05)_1px,transparent_1px)]'
                : 'bg-[linear-gradient(rgba(139,107,97,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.08)_1px,transparent_1px)]'
            }`}></div>
          </div>

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side: Text */}
            <div className="text-center lg:text-left space-y-6 z-10">
              {/* Badge */}
              <div className={`inline-flex items-center space-x-2 backdrop-blur-xl border px-4 py-2 rounded-full text-sm font-semibold mb-4 transition-all duration-300 hover:scale-105 hover:rotate-1 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                  : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
              }`}>
                <FaRobot className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} animate-pulse`} />
                <span>Powered by Advanced AI</span>
              </div>

              <h3 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight transform hover:scale-105 transition-transform duration-300">
                <span className={isDarkMode ? 'text-white' : 'text-[#2C2C2C]'}>AI &</span>
                <br />
                <span className={`bg-clip-text text-transparent ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}>
                  Interior Design
                </span>
              </h3>
              
              <p className={`text-lg lg:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 transition-colors duration-500 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Create your dream room with artificial intelligence and intuitive drag-and-drop features. 
                Transform your space in minutes with our cutting-edge technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  to="/chatbot"
                  className={`group inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl transform hover:scale-105 hover:rotate-1 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077] shadow-[#A58077]/30 hover:shadow-[#A58077]/50'
                      : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61] shadow-[#8B6B61]/30 hover:shadow-[#8B6B61]/50'
                  }`}
                >
                  <FaMagic className="mr-3 text-lg group-hover:rotate-12 transition-transform" />
                  Explore Now
                  <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  "AI-Powered",
                  "Drag & Drop",
                  "Real-time Preview",
                  "Instant Results"
                ].map((feature, idx) => (
                  <div key={idx} className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <FaBolt className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} text-sm`} />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Image with 3D */}
            <div className="relative z-10 perspective-1000">
              <div className="relative group transform-style-3d">
                {/* Glow Effect */}
                <div className={`absolute -inset-2 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}></div>
                
                {/* Image Container */}
                <div className={`relative rounded-3xl p-4 border transition-all transform group-hover:rotate-y-3 group-hover:rotate-x-1 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border-[#A58077]/20 group-hover:border-[#A58077]/40'
                    : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 group-hover:border-[#8B6B61]/40'
                }`}>
                  <img
                    src="/images/AISection.png"
                    alt="AI Design Preview"
                    className="w-full rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/1a1a1a/A58077?text=AI+Design+Preview';
                    }}
                  />
                  
                  {/* Floating Badge with 3D */}
                  <div className={`absolute -top-4 -right-4 text-white p-4 rounded-2xl shadow-2xl animate-bounce hover:scale-110 hover:rotate-12 transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#A58077] to-[#8B6B63]'
                      : 'bg-gradient-to-br from-[#8B6B61] to-[#A58077]'
                  }`}>
                    <FaMagic className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
