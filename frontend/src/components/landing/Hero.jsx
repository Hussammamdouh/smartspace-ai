import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { 
  FaArrowRight, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaAward,
  FaRocket,
  FaPalette,
  FaMagic,
  FaChevronDown,
  FaLightbulb,
  FaBolt
} from "react-icons/fa";

const Hero = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className={`relative min-h-screen w-full overflow-hidden pt-20 transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#0a0a0a] via-[#181818] to-[#1a1a1a]' 
        : 'bg-gradient-to-br from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6]'
    }`}>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Mesh */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#A58077]/20 via-transparent to-[#8B6B63]/20' 
            : 'bg-gradient-to-br from-[#8B6B61]/10 via-transparent to-[#A58077]/10'
        }`}></div>
        
        {/* Animated Orbs */}
        <div className={`absolute top-20 left-20 w-96 h-96 rounded-full blur-[120px] animate-pulse transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] opacity-30' 
            : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] opacity-15'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#8B6B63] to-[#A58077] opacity-25' 
            : 'bg-gradient-to-r from-[#A58077] to-[#8B6B61] opacity-10'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-[#A58077]/10 to-[#8B6B63]/10' 
            : 'bg-gradient-to-r from-[#8B6B61]/5 to-[#A58077]/5'
        }`}></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 bg-[size:50px_50px] transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-[linear-gradient(rgba(165,128,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.03)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(139,107,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.05)_1px,transparent_1px)]'
        }`}></div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full transition-colors duration-500 ${
              isDarkMode ? 'bg-[#A58077] opacity-60' : 'bg-[#8B6B61] opacity-40'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `sparkle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-5rem)]">
          
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 z-10">
            
            {/* Badge */}
            <div className={`inline-flex items-center space-x-3 backdrop-blur-xl border px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:scale-105 transition-all duration-300 group transform hover:rotate-[-2deg] ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE] hover:shadow-[#A58077]/30'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C] hover:shadow-[#8B6B61]/30'
            }`}>
              <FaBolt className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} animate-pulse group-hover:animate-spin`} />
              <span className={`bg-clip-text text-transparent font-bold ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#E5CBBE] to-[#A58077]' 
                  : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
              }`}>
                SmartSpace.AI - AI-Powered Design
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1] tracking-tight transform hover:scale-[1.02] transition-transform duration-300`}>
                <span className={`${isDarkMode ? 'text-white' : 'text-[#2C2C2C]'} block mb-2 transition-colors duration-500`}>Transform Your</span>
                <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}>
                  Living Space
                </span>
                <span className={`${isDarkMode ? 'text-white' : 'text-[#2C2C2C]'} block mt-2 transition-colors duration-500`}>with AI Magic</span>
              </h1>
              
              <p className={`text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Experience the future of interior design with cutting-edge AI technology. 
                Create stunning, personalized spaces in <span className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} font-semibold`}>minutes, not months</span>.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-8">
              {[
                { value: "10K+", label: "Happy Clients", icon: FaUsers },
                { value: "50K+", label: "Designs Created", icon: FaPalette },
                { value: "4.9★", label: "User Rating", icon: FaStar }
              ].map((stat, idx) => (
                <div key={idx} className="text-center group cursor-pointer perspective-1000">
                  <div className={`backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 hover:rotate-y-2 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#A58077]/10 to-[#8B6B63]/10 border-[#A58077]/20 hover:border-[#A58077]/40'
                      : 'bg-gradient-to-br from-[#8B6B61]/10 to-[#A58077]/10 border-[#8B6B61]/20 hover:border-[#8B6B61]/40'
                  }`}>
                    <stat.icon className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} mx-auto mb-2 text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`} />
                    <div className={`text-3xl font-bold bg-clip-text text-transparent transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-white to-[#E5CBBE] group-hover:from-[#A58077] group-hover:to-[#E5CBBE]'
                        : 'bg-gradient-to-r from-[#2C2C2C] to-[#8B6B61] group-hover:from-[#8B6B61] group-hover:to-[#A58077]'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/chatbot"
                className={`group relative inline-flex items-center justify-center px-8 py-4 text-white font-bold rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:rotate-1 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#B89085] to-[#8B6B63] shadow-[#A58077]/30 hover:shadow-[#A58077]/50'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61] shadow-[#8B6B61]/30 hover:shadow-[#8B6B61]/50'
                }`}
              >
                <span className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-[#8B6B63] to-[#A58077]' 
                    : 'bg-gradient-to-r from-[#A58077] to-[#8B6B61]'
                }`}></span>
                <span className="relative flex items-center">
                  <FaPalette className="mr-3 text-lg group-hover:rotate-12 transition-transform duration-300" />
                  Start Designing
                  <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              
              <button className={`group inline-flex items-center justify-center px-8 py-4 backdrop-blur-xl font-semibold rounded-2xl transition-all duration-300 border-2 hover:scale-105 hover:-translate-y-1 shadow-lg transform hover:rotate-[-1deg] ${
                isDarkMode
                  ? 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-[#A58077]/50'
                  : 'bg-[#8B6B61]/5 text-[#2C2C2C] border-[#8B6B61]/20 hover:bg-[#8B6B61]/10 hover:border-[#8B6B61]/50'
              }`}>
                <FaPlay className="mr-3 text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-8">
              {[
                { icon: FaStar, text: "4.9/5 Rating", darkColor: "text-yellow-400", lightColor: "text-yellow-500", darkBg: "from-yellow-500/10 to-yellow-600/10", lightBg: "from-yellow-400/20 to-yellow-500/20", darkBorder: "border-yellow-500/20", lightBorder: "border-yellow-400/30" },
                { icon: FaUsers, text: "10K+ Users", darkColor: "text-[#A58077]", lightColor: "text-[#8B6B61]", darkBg: "from-[#A58077]/10 to-[#8B6B63]/10", lightBg: "from-[#8B6B61]/20 to-[#A58077]/20", darkBorder: "border-[#A58077]/20", lightBorder: "border-[#8B6B61]/30" },
                { icon: FaAward, text: "Award Winner", darkColor: "text-[#E5CBBE]", lightColor: "text-[#8B6B61]", darkBg: "from-[#8B6B63]/10 to-[#A58077]/10", lightBg: "from-[#A58077]/20 to-[#8B6B61]/20", darkBorder: "border-[#8B6B63]/20", lightBorder: "border-[#A58077]/30" }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center space-x-2 backdrop-blur-xl border px-5 py-2.5 rounded-full hover:scale-105 hover:rotate-1 transition-all duration-300 shadow-lg transform ${
                  isDarkMode
                    ? `bg-gradient-to-r ${item.darkBg} ${item.darkBorder}`
                    : `bg-gradient-to-r ${item.lightBg} ${item.lightBorder}`
                }`}>
                  <item.icon className={`${isDarkMode ? item.darkColor : item.lightColor} text-lg`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
                  }`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image/Animation */}
          <div className="relative z-10 perspective-1000">
            <div className="relative transform-style-3d">
              {/* Main Hero Image Container */}
              <div className="relative group transform-style-3d">
                {/* Glow Effect */}
                <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}></div>
                
                {/* Image Card with 3D Effect */}
                <div className={`relative rounded-3xl p-6 shadow-2xl border transition-all duration-500 transform group-hover:rotate-y-2 group-hover:rotate-x-1 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#A58077]/20 hover:border-[#A58077]/40'
                    : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 hover:border-[#8B6B61]/40'
                }`}>
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src="/images/hero.png"
                      alt="AI Interior Design"
                      className="w-full h-auto rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/2C2C2C/A58077?text=AI+Interior+Design';
                      }}
                    />
                    {/* Overlay Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isDarkMode ? 'from-black/50' : 'from-white/30'
                    }`}></div>
                  </div>
                  
                  {/* Floating AI Badge with 3D */}
                  <div className={`absolute -top-3 -right-3 text-white p-4 rounded-2xl shadow-2xl animate-bounce hover:scale-110 hover:rotate-12 transition-all cursor-pointer transform-style-3d ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#A58077] to-[#8B6B63]'
                      : 'bg-gradient-to-br from-[#8B6B61] to-[#A58077]'
                  }`}>
                    <FaMagic className="text-2xl" />
                  </div>
                  
                  {/* Stats Badge */}
                  <div className={`absolute -bottom-3 -left-3 backdrop-blur-xl border-2 p-4 rounded-2xl shadow-2xl hover:scale-105 hover:rotate-[-5deg] transition-all transform-style-3d ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1a1a1a]/95 to-[#0f0f0f]/95 border-[#A58077]/40 text-white'
                      : 'bg-gradient-to-br from-white/95 to-[#FAF7F3]/95 border-[#8B6B61]/40 text-[#2C2C2C]'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>AI Generated</div>
                    <div className={`text-sm font-bold bg-clip-text text-transparent ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-white to-[#E5CBBE]'
                        : 'bg-gradient-to-r from-[#2C2C2C] to-[#8B6B61]'
                    }`}>100% Unique</div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards with 3D */}
              {[
                { icon: FaPalette, title: "Smart Design", subtitle: "AI-Powered", position: "-top-8 -left-8", delay: "0s", darkGradient: "from-[#A58077] to-[#8B6B63]", lightGradient: "from-[#8B6B61] to-[#A58077]" },
                { icon: FaRocket, title: "Fast Results", subtitle: "Minutes, not months", position: "-bottom-8 -right-8", delay: "0.5s", darkGradient: "from-[#8B6B63] to-[#A58077]", lightGradient: "from-[#A58077] to-[#8B6B61]" },
                { icon: FaLightbulb, title: "Creative AI", subtitle: "Endless Ideas", position: "top-1/2 -right-4", delay: "1s", darkGradient: "from-[#E5CBBE] to-[#A58077]", lightGradient: "from-[#A58077] to-[#8B6B61]" }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className={`absolute ${card.position} backdrop-blur-xl border-2 rounded-2xl p-4 shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer group transform-style-3d hover:rotate-y-6 hover:rotate-x-3 ${
                    isDarkMode
                      ? `bg-gradient-to-br from-[#1a1a1a]/95 to-[#0f0f0f]/95 border-[#A58077]/30 hover:border-[#A58077]/60`
                      : `bg-gradient-to-br from-white/95 to-[#FAF7F3]/95 border-[#8B6B61]/30 hover:border-[#8B6B61]/60`
                  }`}
                  style={{ animation: `float 3s ease-in-out infinite`, animationDelay: card.delay }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${isDarkMode ? card.darkGradient : card.lightGradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                      <card.icon className="text-white text-xl" />
                    </div>
                    <div>
                      <div className={`font-bold text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
                      }`}>{card.title}</div>
                      <div className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{card.subtitle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center space-y-2 group cursor-pointer">
          <div className={`w-8 h-12 border-2 rounded-full flex justify-center hover:scale-110 transition-all duration-300 ${
            isDarkMode 
              ? 'border-[#A58077]/50 hover:border-[#A58077]' 
              : 'border-[#8B6B61]/50 hover:border-[#8B6B61]'
          }`}>
            <div className={`w-1 h-4 bg-gradient-to-b rounded-full mt-2 animate-bounce ${
              isDarkMode 
                ? 'from-[#A58077] to-[#8B6B63]' 
                : 'from-[#8B6B61] to-[#A58077]'
            }`}></div>
          </div>
          <FaChevronDown className={`${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} animate-bounce text-sm`} />
        </div>
      </div>

    </section>
  );
};

export default Hero;
