import { Link } from "react-router-dom";
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
      { name: "AI Design", to: "/generate-image" },
      { name: "Interior Consultation", to: "/consultation" },
      { name: "3D Visualization", to: "/3d-visualization" },
      { name: "Project Management", to: "/project-management" },
    ],
    support: [
      { name: "Help Center", to: "/help" },
      { name: "Contact Us", to: "/contact" },
      { name: "Live Chat", to: "/chat" },
      { name: "FAQ", to: "/faq" },
    ],
    legal: [
      { name: "Privacy Policy", to: "/privacy" },
      { name: "Terms of Service", to: "/terms" },
      { name: "Cookie Policy", to: "/cookies" },
      { name: "GDPR", to: "/gdpr" },
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
    <footer className="bg-theme-background text-theme-text relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#A58077] via-transparent to-[#8B6B63]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23A58077%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Section */}
        <div className="py-16 border-b border-theme-border/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-text mb-2 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed group-hover:text-theme-text transition-colors duration-300">
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
                <div className="w-14 h-14 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-2xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 overflow-hidden">
                  <img 
                    src="/images/Logo.JPG" 
                    alt="SmartSpace.AI Logo" 
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="text-white font-bold text-2xl hidden">AI</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-[#E5CBBE] to-[#A58077] bg-clip-text text-transparent">
                    SmartSpace.AI
                  </h3>
                  <p className="text-theme-text-secondary text-sm font-medium">AI-Powered Solutions</p>
                </div>
              </div>
              
              <p className="text-theme-text-secondary mb-8 leading-relaxed text-lg">
                Transform your living spaces with cutting-edge AI technology. 
                We combine artificial intelligence with expert design principles 
                to create stunning, personalized interiors that reflect your unique style.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-theme-text-secondary hover:text-theme-text transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-theme-surface rounded-xl flex items-center justify-center group-hover:bg-[#A58077] group-hover:scale-110 transition-all duration-300">
                    <FaPhone className="text-theme-text-secondary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-medium">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-4 text-theme-text-secondary hover:text-theme-text transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-theme-surface rounded-xl flex items-center justify-center group-hover:bg-[#A58077] group-hover:scale-110 transition-all duration-300">
                    <FaEnvelope className="text-theme-text-secondary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-medium">hello@aiinteriordesign.com</span>
                </div>
                <div className="flex items-center space-x-4 text-theme-text-secondary hover:text-theme-text transition-all duration-300 group cursor-pointer">
                  <div className="w-10 h-10 bg-theme-surface rounded-xl flex items-center justify-center group-hover:bg-[#A58077] group-hover:scale-110 transition-all duration-300">
                    <FaMapMarkerAlt className="text-theme-text-secondary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-medium">123 Design Street, Creative City, CC 12345</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xl font-semibold text-theme-text mb-6 relative">
                Company
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#A58077] to-[#8B6B63] rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-theme-text-secondary hover:text-theme-text transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A58077] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-xl font-semibold text-theme-text mb-6 relative">
                Services
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#A58077] to-[#8B6B63] rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-theme-text-secondary hover:text-theme-text transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A58077] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-xl font-semibold text-theme-text mb-6 relative">
                Support
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-[#A58077] to-[#8B6B63] rounded-full"></div>
              </h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-theme-text-secondary hover:text-theme-text transition-all duration-300 hover:translate-x-2 transform inline-block font-medium group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#A58077] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-theme-border/30 py-12">
          <div className="bg-theme-surface/50 rounded-2xl p-8 backdrop-blur-sm border border-theme-border/20">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
              <div className="text-center lg:text-left flex-1">
                <h4 className="text-2xl font-bold text-theme-text mb-3">
                  Stay Updated with Our Latest Designs
                </h4>
                <p className="text-theme-text-secondary text-lg leading-relaxed">
                  Get exclusive access to new AI design features, inspiration, and early access to premium tools.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-theme-surface-light/80 backdrop-blur-sm text-theme-text border border-theme-border/50 rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 transition-all duration-300 placeholder-theme-text-secondary/60 font-medium"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-theme-border/30 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-theme-text-secondary font-medium">
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
                    className="w-12 h-12 bg-theme-surface text-theme-text-secondary rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl group"
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
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Scroll to top"
      >
        <FaArrowUp className="text-lg" />
      </button>
    </footer>
  );
};

export default Footer;
