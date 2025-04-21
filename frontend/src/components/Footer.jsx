import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#181818] text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Links Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-2xl font-bold">SmartSpace AI</h3>
          </div>

          <div>
            <h3 className="font-bold mb-2">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/docs" className="text-gray-400 hover:text-white">Docs</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">Solutions</h3>
            <ul className="space-y-2">
              <li><Link to="/drag-drop" className="text-gray-400 hover:text-white">Drag & Drop</Link></li>
              <li><Link to="/graphic-design" className="text-gray-400 hover:text-white">Graphic Design</Link></li>
              <li><Link to="/ai-system" className="text-gray-400 hover:text-white">AI System</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-2">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 mb-10">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF className="w-6 h-6 text-gray-400 hover:text-white transition-all" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter className="w-6 h-6 text-gray-400 hover:text-white transition-all" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram className="w-6 h-6 text-gray-400 hover:text-white transition-all" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin className="w-6 h-6 text-gray-400 hover:text-white transition-all" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400">
          <p>Copyright © 2024 Wahby. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
