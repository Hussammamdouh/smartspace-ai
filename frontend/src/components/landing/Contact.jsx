import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Contact = () => {
  const [email, setEmail] = useState("");
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <section className="bg-[#181818] text-white px-6 py-20" id="contact">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-5xl font-extrabold mb-12 tracking-tight">
          <span className="text-white">
            <span className="text-[#A58077]">C</span>ontact{" "}
            <span className="text-[#A58077]">U</span>s
          </span>
        </h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Form Card */}
          <div className="bg-[#1e1e1e] rounded-2xl p-8 shadow-2xl relative">
            <h3 className="text-2xl font-semibold text-[#E5CBBE] mb-6">E_MAIL</h3>

            {/* Email Input */}
            <div className="relative mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent border-b border-[#A09C9C] py-2 pr-8 text-sm text-white focus:outline-none placeholder:text-[#aaa]"
              />
              {email.length > 0 && (
                <span className="absolute right-2 top-2 text-lg">
                  {isValidEmail(email) ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </span>
              )}
            </div>

            {/* Secondary Field */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Wahby.com"
                className="w-full bg-transparent border-b border-[#A09C9C] py-2 pr-8 text-sm text-white focus:outline-none placeholder:text-[#aaa]"
              />
              <FaTimesCircle className="absolute right-2 top-2 text-red-500" />
            </div>

            {/* Third Optional Field */}
            <input
              type="text"
              placeholder="If you don't remember Email...!?"
              className="w-full bg-transparent border-b border-[#A09C9C] py-2 mb-6 text-sm text-white placeholder:text-[#aaa] focus:outline-none"
            />

            {/* Footer Message + Button */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-[#A09C9C] max-w-[60%]">
                Thank you for interested with us and we will receive you
              </p>
              <button className="bg-[#2c2c2c] hover:bg-[#A58077] px-6 py-2 rounded-lg transition text-white text-sm font-medium">
                Send
              </button>
            </div>
          </div>

          {/* Right: Image */}
          <div>
            <img
              src="/images/about1.png"
              alt="Interior Contact"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
