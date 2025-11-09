import { FaAward, FaUsers, FaRocket, FaPalette } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const About = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    { icon: FaPalette, title: "AI-Powered Design", description: "Create stunning interiors with cutting-edge AI technology" },
    { icon: FaRocket, title: "Fast & Efficient", description: "Get your designs in minutes, not months" },
    { icon: FaUsers, title: "Expert Team", description: "Work with specialized engineers and designers" },
    { icon: FaAward, title: "Premium Quality", description: "Finest materials that last for years" }
  ];

  return (
    <section id="about" className={`relative py-24 overflow-hidden transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-b from-[#181818] via-[#1a1a1a] to-[#181818] text-white'
        : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
        }`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-[#A58077] uppercase tracking-wider">About Us</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className={`bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-white via-[#E5CBBE] to-white'
                : 'bg-gradient-to-r from-[#2C2C2C] via-[#8B6B61] to-[#2C2C2C]'
            }`}>
              Crafting Beautiful
            </span>
            <br />
            <span className={`bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
            }`}>
              Living Spaces
            </span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            We combine cutting-edge AI technology with expert craftsmanship to transform your vision into reality
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`group relative border rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:rotate-y-2 perspective-1000 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#A58077]/20 hover:border-[#A58077]/40'
                  : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 hover:border-[#8B6B61]/40 shadow-lg'
              }`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all ${
                isDarkMode
                  ? 'from-[#A58077] to-[#8B6B63]'
                  : 'from-[#8B6B61] to-[#A58077]'
              }`}>
                <feature.icon className="text-white text-2xl" />
              </div>
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
              }`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className={`text-3xl font-bold transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
            }`}>
              Welcome to <span className={isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'}>SmartSpace.AI</span>
            </h3>
            <p className={`text-lg leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              We are here to create the best furniture for you at competitive prices. We use the finest materials that will last with you for the longest possible time, ensuring quality and durability in every piece.
            </p>
            <p className={`text-lg leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Our platform features advanced artificial intelligence and intuitive drag-and-drop tools to help you design your home comfortably. With us, you'll enjoy all means of comfort with specialists in their fields and specialized engineers in decoration.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {['Premium Materials', 'Expert Designers', 'AI Technology'].map((tag, idx) => (
                <div key={idx} className={`px-4 py-2 border rounded-full text-sm transition-all duration-300 hover:scale-110 hover:rotate-1 ${
                  isDarkMode
                    ? 'bg-[#A58077]/10 border-[#A58077]/30 text-[#E5CBBE]'
                    : 'bg-[#8B6B61]/10 border-[#8B6B61]/30 text-[#2C2C2C]'
                }`}>
                  ✓ {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Image Grid with 3D Effects */}
          <div className="grid grid-cols-2 gap-4 perspective-1000">
            <div className="relative group col-span-2 transform-style-3d">
              <div className={`absolute inset-0 bg-gradient-to-t to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode ? 'from-[#A58077]/20' : 'from-[#8B6B61]/20'
              }`}></div>
              <img
                src="/images/about1.png"
                alt="Interior Design"
                className="w-full h-64 object-cover rounded-2xl shadow-2xl group-hover:scale-105 group-hover:rotate-y-2 transition-all duration-500"
              />
            </div>
            <div className="relative group transform-style-3d">
              <div className={`absolute inset-0 bg-gradient-to-t to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode ? 'from-[#A58077]/20' : 'from-[#8B6B61]/20'
              }`}></div>
              <img
                src="/images/about2.png"
                alt="Room Design"
                className="w-full h-48 object-cover rounded-xl shadow-xl group-hover:scale-105 group-hover:rotate-x-2 transition-all duration-500"
              />
            </div>
            <div className="relative group transform-style-3d">
              <div className={`absolute inset-0 bg-gradient-to-t to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${
                isDarkMode ? 'from-[#A58077]/20' : 'from-[#8B6B61]/20'
              }`}></div>
              <img
                src="/images/about3.png"
                alt="Room Design"
                className="w-full h-48 object-cover rounded-xl shadow-xl group-hover:scale-105 group-hover:rotate-x-[-2deg] transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
