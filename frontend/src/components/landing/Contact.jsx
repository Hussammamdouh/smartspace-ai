import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaEnvelope, FaPaperPlane, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const Contact = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({ email, name, message });
  };

  return (
    <section className={`relative py-24 overflow-hidden transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-b from-[#181818] to-[#0a0a0a] text-white'
        : 'bg-gradient-to-b from-[#F5F1ED] to-[#FAF7F3] text-[#2C2C2C]'
    }`} id="contact">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-[#8B6B63]/10' : 'bg-[#A58077]/5'
        }`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-[#A58077] uppercase tracking-wider">Get In Touch</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className={`bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-white to-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#2C2C2C] to-[#8B6B61]'
            }`}>
              Contact
            </span>
            <span className={`bg-clip-text text-transparent ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
            }`}> Us</span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Form Card with 3D */}
          <div className={`relative border-2 rounded-3xl p-8 lg:p-10 shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:rotate-y-1 perspective-1000 ${
            isDarkMode
              ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#A58077]/20 hover:border-[#A58077]/40'
              : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 hover:border-[#8B6B61]/40'
          }`}>
            <div className="flex items-center space-x-3 mb-8">
              <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center ${
                isDarkMode
                  ? 'from-[#A58077] to-[#8B6B63]'
                  : 'from-[#8B6B61] to-[#A58077]'
              }`}>
                <FaEnvelope className="text-white text-xl" />
              </div>
              <h3 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
              }`}>Send us a Message</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full border-2 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none transition-all duration-300 transform focus:scale-[1.02] ${
                    isDarkMode
                      ? 'bg-[#0f0f0f] border-[#A58077]/20 text-white focus:border-[#A58077]'
                      : 'bg-white border-[#8B6B61]/20 text-[#2C2C2C] focus:border-[#8B6B61]'
                  }`}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className={`w-full border-2 rounded-xl px-4 py-3 pr-12 placeholder-gray-500 focus:outline-none transition-all duration-300 transform focus:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-[#0f0f0f] border-[#A58077]/20 text-white focus:border-[#A58077]'
                        : 'bg-white border-[#8B6B61]/20 text-[#2C2C2C] focus:border-[#8B6B61]'
                    }`}
                  />
                  {email.length > 0 && (
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg">
                      {isValidEmail(email) ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project..."
                  rows={5}
                  className={`w-full border-2 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none transform focus:scale-[1.02] ${
                    isDarkMode
                      ? 'bg-[#0f0f0f] border-[#A58077]/20 text-white focus:border-[#A58077]'
                      : 'bg-white border-[#8B6B61]/20 text-[#2C2C2C] focus:border-[#8B6B61]'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-2xl transform hover:scale-105 hover:rotate-1 flex items-center justify-center space-x-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077] shadow-[#A58077]/30 hover:shadow-[#A58077]/50'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61] shadow-[#8B6B61]/30 hover:shadow-[#8B6B61]/50'
                }`}
              >
                <FaPaperPlane className="text-lg group-hover:translate-x-1 transition-transform" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Right: Contact Info & Image */}
          <div className="space-y-8">
            {/* Contact Info Cards with 3D */}
            <div className="grid gap-6">
              {[
                { icon: FaEnvelope, title: "Email", content: "contact@smartspace.ai", darkColor: "from-[#A58077] to-[#8B6B63]", lightColor: "from-[#8B6B61] to-[#A58077]" },
                { icon: FaPhone, title: "Phone", content: "+1 (555) 123-4567", darkColor: "from-[#8B6B63] to-[#A58077]", lightColor: "from-[#A58077] to-[#8B6B61]" },
                { icon: FaMapMarkerAlt, title: "Location", content: "San Francisco, CA", darkColor: "from-[#A58077] to-[#E5CBBE]", lightColor: "from-[#8B6B61] to-[#A58077]" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:rotate-y-2 perspective-1000 ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-[#A58077]/20 hover:border-[#A58077]/40'
                      : 'bg-gradient-to-br from-white to-[#FAF7F3] border-[#8B6B61]/20 hover:border-[#8B6B61]/40'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg hover:rotate-12 transition-transform ${
                      isDarkMode ? item.darkColor : item.lightColor
                    }`}>
                      <item.icon className="text-white text-xl" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{item.title}</div>
                      <div className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
                      }`}>{item.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Image with 3D */}
            <div className="relative group perspective-1000">
              <div className={`absolute -inset-1 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63]'
                  : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077]'
              }`}></div>
              <img
                src="/images/about1.png"
                alt="Contact Us"
                className="relative w-full rounded-2xl shadow-2xl group-hover:scale-105 group-hover:rotate-y-2 transition-all duration-500 transform-style-3d"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
