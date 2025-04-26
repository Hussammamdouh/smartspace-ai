import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#181818] text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="text-3xl font-bold text-[#E5CBBE] mb-2">SmartSpace AI</h3>
            <p className="text-sm text-gray-400">Transforming your interior vision with intelligent design.</p>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-[#A58077]">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="text-gray-400 hover:text-[#E5CBBE] transition">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-[#E5CBBE] transition">Pricing</Link></li>
              <li><Link to="/docs" className="text-gray-400 hover:text-[#E5CBBE] transition">Docs</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-[#E5CBBE] transition">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-[#A58077]">Solutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/drag-drop" className="text-gray-400 hover:text-[#E5CBBE] transition">Drag & Drop</Link></li>
              <li><Link to="/graphic-design" className="text-gray-400 hover:text-[#E5CBBE] transition">Graphic Design</Link></li>
              <li><Link to="/ai-system" className="text-gray-400 hover:text-[#E5CBBE] transition">AI System</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-3 text-[#A58077]">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-[#E5CBBE] transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-[#E5CBBE] transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-6 mb-10">
          <SocialIcon href="https://facebook.com" label="Facebook">
            <FaFacebookF />
          </SocialIcon>
          <SocialIcon href="https://twitter.com" label="Twitter">
            <FaTwitter />
          </SocialIcon>
          <SocialIcon href="https://instagram.com" label="Instagram">
            <FaInstagram />
          </SocialIcon>
          <SocialIcon href="https://linkedin.com" label="LinkedIn">
            <FaLinkedin />
          </SocialIcon>
        </div>

        {/* Footer Bottom */}
        <div className="text-center text-sm text-gray-500 border-t border-[#2a2a2a] pt-6">
          <p>&copy; {new Date().getFullYear()} Wahby. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-gray-400 hover:text-[#E5CBBE] hover:scale-110 transition-all duration-200"
  >
    {children}
  </a>
);

export default Footer;
