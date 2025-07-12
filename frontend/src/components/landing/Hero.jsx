import { Link } from "react-router-dom";
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
  FaLightbulb
} from "react-icons/fa";

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full bg-theme-background overflow-hidden pt-24">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A58077] via-transparent to-[#8B6B63]"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#A58077] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8B6B63] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#A58077]/5 to-[#8B6B63]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#A58077] rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-3 h-3 bg-[#E5CBBE] rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-[#8B6B63] rounded-full animate-bounce"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#A58077] rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-[#E5CBBE] rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-[#8B6B63] rounded-full animate-bounce"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
          
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#A58077]/10 to-[#8B6B63]/10 border border-[#A58077]/20 text-[#A58077] px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <FaRocket className="text-[#A58077] animate-pulse" />
              <span>SmartSpace.AI - AI-Powered Design</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-theme-text">Transform Your</span>
                <br />
                <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent animate-pulse">
                  Living Space
                </span>
                <br />
                <span className="text-theme-text">with SmartSpace.AI</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-theme-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Experience the future of interior design with our cutting-edge AI technology. 
                Create stunning, personalized spaces in minutes, not months. Let SmartSpace.AI bring your vision to life.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="text-center group">
                <div className="text-3xl font-bold text-theme-text group-hover:text-white transition-colors duration-300">10K+</div>
                <div className="text-sm text-theme-text-secondary font-medium">Happy Clients</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-theme-text group-hover:text-white transition-colors duration-300">50K+</div>
                <div className="text-sm text-theme-text-secondary font-medium">Designs Created</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-theme-text group-hover:text-white transition-colors duration-300">4.9★</div>
                <div className="text-sm text-theme-text-secondary font-medium">User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/chatbot"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white font-semibold rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                <FaPalette className="mr-3 text-lg" />
                Start Designing
                <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              
              <button className="group inline-flex items-center justify-center px-8 py-4 bg-theme-surface/80 backdrop-blur-sm text-theme-text font-semibold rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-theme-border hover:border-[#A58077] hover:scale-105 hover:-translate-y-1">
                <FaPlay className="mr-3 text-lg" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-8">
              <div className="flex items-center space-x-1 bg-theme-surface/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <span className="text-theme-text-secondary text-sm ml-2 font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-theme-text-secondary text-sm bg-theme-surface/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaUsers className="text-theme-text" />
                <span className="font-medium">Trusted by 10K+ users</span>
              </div>
              <div className="flex items-center space-x-2 text-theme-text-secondary text-sm bg-theme-surface/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <FaAward className="text-theme-text" />
                <span className="font-medium">Industry Award Winner</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Animation */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Hero Image */}
              <div className="relative bg-theme-surface rounded-3xl p-8 shadow-2xl border border-theme-border hover:shadow-[#A58077]/20 transition-all duration-500 group">
                <img
                  src="/images/hero.png"
                  alt="AI Interior Design"
                  className="w-full h-auto rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400/2C2C2C/A58077?text=AI+Interior+Design';
                  }}
                />
                
                {/* Floating AI Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#A58077] to-[#8B6B63] text-white p-4 rounded-2xl shadow-lg animate-bounce">
                  <FaMagic className="text-2xl" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-theme-surface/90 backdrop-blur-sm border border-[#A58077] text-[#A58077] p-4 rounded-xl shadow-lg">
                  <div className="text-xs font-medium">AI Generated</div>
                  <div className="text-sm font-bold">100% Unique</div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-8 -left-8 bg-theme-surface/90 backdrop-blur-sm border border-theme-border rounded-xl p-4 shadow-lg animate-float hover:scale-110 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center">
                    <FaPalette className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-theme-text font-semibold">Smart Design</div>
                    <div className="text-theme-text-secondary text-sm">AI-Powered</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 bg-theme-surface/90 backdrop-blur-sm border border-theme-border rounded-xl p-4 shadow-lg animate-float-delayed hover:scale-110 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B6B63] to-[#A58077] rounded-xl flex items-center justify-center">
                    <FaRocket className="text-white text-lg" />
                  </div>
                  <div>
                    <div className="text-theme-text font-semibold">Fast Results</div>
                    <div className="text-theme-text-secondary text-sm">Minutes, not months</div>
                  </div>
                </div>
              </div>

              {/* Additional Floating Card */}
              <div className="absolute top-1/2 -right-4 bg-theme-surface/90 backdrop-blur-sm border border-theme-border rounded-xl p-4 shadow-lg animate-float-slow hover:scale-110 transition-transform duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E5CBBE] to-[#A58077] rounded-xl flex items-center justify-center">
                    <FaLightbulb className="text-theme-surface text-lg" />
                  </div>
                  <div>
                    <div className="text-theme-text font-semibold">Creative AI</div>
                    <div className="text-theme-text-secondary text-sm">Endless Ideas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-[#A58077] rounded-full flex justify-center group cursor-pointer hover:scale-110 transition-transform duration-300">
          <div className="w-1 h-4 bg-[#A58077] rounded-full mt-2 animate-pulse group-hover:animate-bounce"></div>
        </div>
        <div className="text-center mt-2">
          <FaChevronDown className="text-[#A58077] animate-pulse mx-auto" />
        </div>
      </div>

      {/* CSS Animations */}
    </section>
  );
};

export default Hero;
