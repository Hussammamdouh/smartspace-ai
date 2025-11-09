import { FaProjectDiagram, FaCalendarAlt, FaUsers, FaTrophy } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const Stats = () => {
  const { isDarkMode } = useTheme();
  
  const stats = [
    { icon: FaProjectDiagram, value: "140+", label: "Projects Created", darkColor: "from-[#A58077] to-[#8B6B63]", lightColor: "from-[#8B6B61] to-[#A58077]" },
    { icon: FaCalendarAlt, value: "5+", label: "Years Experience", darkColor: "from-[#8B6B63] to-[#A58077]", lightColor: "from-[#A58077] to-[#8B6B61]" },
    { icon: FaUsers, value: "120K+", label: "Happy Visitors", darkColor: "from-[#A58077] to-[#E5CBBE]", lightColor: "from-[#8B6B61] to-[#A58077]" },
    { icon: FaTrophy, value: "50K+", label: "Designs Generated", darkColor: "from-[#E5CBBE] to-[#A58077]", lightColor: "from-[#A58077] to-[#8B6B61]" }
  ];

  return (
    <section className={`relative py-20 overflow-hidden transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-b from-[#0a0a0a] to-[#181818] text-white'
        : 'bg-gradient-to-b from-[#F0EBE6] to-[#FAF7F3] text-[#2C2C2C]'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/5' : 'bg-[#8B6B61]/3'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/5' : 'bg-[#A58077]/3'
        }`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`group relative border-2 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:rotate-y-3 perspective-1000 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#A58077]/20 hover:border-[#A58077]/40 hover:shadow-2xl hover:shadow-[#A58077]/20'
                  : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 hover:border-[#8B6B61]/40 hover:shadow-2xl hover:shadow-[#8B6B61]/20'
              }`}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-lg ${
                isDarkMode ? stat.darkColor : stat.lightColor
              }`}>
                <stat.icon className="text-white text-2xl" />
              </div>
              
              {/* Value */}
              <h3 className={`text-4xl lg:text-5xl font-extrabold mb-2 bg-clip-text text-transparent ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white to-[#E5CBBE]'
                  : 'bg-gradient-to-r from-[#2C2C2C] to-[#8B6B61]'
              }`}>
                {stat.value}
              </h3>
              
              {/* Label */}
              <p className={`text-sm font-medium uppercase tracking-wider transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </p>

              {/* Hover Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 ${
                isDarkMode ? stat.darkColor : stat.lightColor
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
