import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowUp,
  FaHeart,
  FaRocket,
  FaShieldAlt,
  FaUsers,
  FaLightbulb
} from "react-icons/fa";

const Footer = () => {
  const { isDarkMode } = useTheme();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", to: "/about" },
      { name: "Our Team", to: "/team" },
      { name: "Careers", to: "/careers" },
      { name: "Press", to: "/press" },
    ],
    services: [
      { name: "AI Design", to: "/chatbot" },
      { name: "Project Management", to: "/project-management" },
    ],
    support: [
      { name: "Help Center", to: "/help" },
      { name: "Contact Us", to: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", to: "/privacy" },
      { name: "Terms of Service", to: "/terms" },
      { name: "Cookie Policy", to: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
  ];

  const features = [
    { icon: FaRocket, title: "AI-Powered", description: "Advanced algorithms for stunning designs" },
    { icon: FaShieldAlt, title: "Secure", description: "Your data is protected with enterprise security" },
    { icon: FaUsers, title: "Expert Team", description: "Professional designers and AI specialists" },
    { icon: FaLightbulb, title: "Innovative", description: "Cutting-edge technology meets creativity" },
  ];

  return (
    <footer className={`relative overflow-hidden z-10 transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-[#181818] text-[#E5CBBE]' 
        : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
        }`} style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 bg-[size:50px_50px] transition-opacity duration-500 ${
          isDarkMode 
            ? 'bg-[linear-gradient(rgba(165,128,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(165,128,119,0.03)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(139,107,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,107,97,0.05)_1px,transparent_1px)]'
        }`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Features Section */}
        <div className={`py-16 border-b transition-colors duration-500 ${
          isDarkMode ? 'border-[#3C3C3C]/30' : 'border-[#E5D3C7]/30'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 perspective-1000 ${
                    isDarkMode
                      ? 'from-[#A58077] to-[#8B6B63]'
                      : 'from-[#8B6B61] to-[#A58077]'
                  }`}>
                    <Icon className="text-white text-2xl group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-[#E5CBBE] group-hover:text-white'
                      : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-[#A58077] group-hover:text-[#E5CBBE]'
                      : 'text-[#8B6B61] group-hover:text-[#2C2C2C]'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 overflow-hidden perspective-1000 ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <img 
                    src="/images/Logo.JPG" 
                    alt="SmartSpace.AI Logo" 
                    className="w-full h-full object-cover rounded-xl transform hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="text-white font-bold text-2xl hidden">AI</span>
                </div>
                <div>
                  <h3 className={`text-3xl font-bold bg-clip-text text-transparent ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#E5CBBE] to-[#A58077]'
                      : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
                  }`}>
                    SmartSpace.AI
                  </h3>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>AI-Powered Solutions</p>
                </div>
              </div>
              
              <p className={`mb-8 leading-relaxed text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Transform your living spaces with cutting-edge AI technology. 
                We combine artificial intelligence with expert design principles 
                to create stunning, personalized interiors that reflect your unique style.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                {[
                  { icon: FaPhone, text: "+1 (555) 123-4567" },
                  { icon: FaEnvelope, text: "hello@aiinteriordesign.com" },
                  { icon: FaMapMarkerAlt, text: "123 Design Street, Creative City, CC 12345" }
                ].map((contact, idx) => (
                  <div key={idx} className={`flex items-center space-x-4 transition-all duration-300 group cursor-pointer transform hover:scale-105 ${
                    isDarkMode
                      ? 'text-[#A58077] hover:text-[#E5CBBE]'
                      : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-[#2C2C2C] group-hover:bg-gradient-to-r group-hover:from-[#A58077] group-hover:to-[#8B6B63]'
                        : 'bg-white group-hover:bg-gradient-to-r group-hover:from-[#8B6B61] group-hover:to-[#A58077] shadow-md'
                    }`}>
                      <contact.icon className={`transition-colors duration-300 ${
                        isDarkMode
                          ? 'text-[#A58077] group-hover:text-white'
                          : 'text-[#8B6B61] group-hover:text-white'
                      }`} />
                    </div>
                    <span className="font-medium">{contact.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className={`text-xl font-semibold mb-6 relative transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>
                Company
                <div className={`absolute bottom-0 left-0 w-12 h-0.5 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
                }`}></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className={`transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group ${
                        isDarkMode
                          ? 'text-[#A58077] hover:text-[#E5CBBE]'
                          : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                      }`}
                    >
                      <span className="relative">
                        {link.name}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                          isDarkMode ? 'bg-[#A58077]' : 'bg-[#8B6B61]'
                        }`}></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className={`text-xl font-semibold mb-6 relative transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>
                Services
                <div className={`absolute bottom-0 left-0 w-12 h-0.5 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
                }`}></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className={`transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group ${
                        isDarkMode
                          ? 'text-[#A58077] hover:text-[#E5CBBE]'
                          : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                      }`}
                    >
                      <span className="relative">
                        {link.name}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                          isDarkMode ? 'bg-[#A58077]' : 'bg-[#8B6B61]'
                        }`}></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className={`text-xl font-semibold mb-6 relative transition-colors duration-300 ${
                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
              }`}>
                Support
                <div className={`absolute bottom-0 left-0 w-12 h-0.5 rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
                }`}></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className={`transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group ${
                        isDarkMode
                          ? 'text-[#A58077] hover:text-[#E5CBBE]'
                          : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                      }`}
                    >
                      <span className="relative">
                        {link.name}
                        <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                          isDarkMode ? 'bg-[#A58077]' : 'bg-[#8B6B61]'
                        }`}></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={`border-t py-12 transition-colors duration-500 ${
          isDarkMode ? 'border-[#3C3C3C]/30' : 'border-[#E5D3C7]/30'
        }`}>
          <div className={`rounded-2xl p-8 backdrop-blur-sm border transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
            isDarkMode
              ? 'bg-[#2C2C2C]/50 border-[#3C3C3C]/20'
              : 'bg-white/50 border-[#E5D3C7]/20 shadow-lg'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
              <div className="text-center lg:text-left flex-1">
                <h4 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Stay Updated with Our Latest Designs
                </h4>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get exclusive access to new AI design features, inspiration, and early access to premium tools.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`flex-1 px-6 py-4 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] font-medium ${
                    isDarkMode
                      ? 'bg-[#1e1e1e]/80 text-[#E5CBBE] border-[#3C3C3C]/50 focus:border-[#A58077] focus:ring-[#A58077]/20 placeholder-gray-500'
                      : 'bg-white/80 text-[#2C2C2C] border-[#E5D3C7]/50 focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 placeholder-gray-400 shadow-md'
                  }`}
                />
                <button className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t py-8 transition-colors duration-500 ${
          isDarkMode ? 'border-[#3C3C3C]/30' : 'border-[#E5D3C7]/30'
        }`}>
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className={`font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                © {currentYear} SmartSpace.AI. All rights reserved. Made with{" "}
                <FaHeart className="inline text-red-500 mx-1 animate-pulse" />
                for beautiful spaces.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group transform hover:rotate-12 ${
                      isDarkMode
                        ? 'bg-[#2C2C2C] text-[#A58077] hover:bg-gradient-to-br hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white'
                        : 'bg-white text-[#8B6B61] hover:bg-gradient-to-br hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white'
                    }`}
                  >
                    <Icon className="text-xl group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center transform hover:rotate-12 ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#A58077] to-[#8B6B63]'
            : 'bg-gradient-to-br from-[#8B6B61] to-[#A58077]'
        }`}
        aria-label="Scroll to top"
      >
        <FaArrowUp className="text-lg" />
      </button>
    </footer>
  );
};

export default Footer;
