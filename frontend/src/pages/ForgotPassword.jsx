import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import { 
  FaEnvelope, 
  FaArrowLeft, 
  FaSpinner,
  FaCheckCircle,
  FaShieldAlt
} from "react-icons/fa";

const ForgotPassword = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/forgotPassword', { email });

      if (response.data.status === 'success') {
        setSubmitted(true);
        toast.success("If an account exists with this email, password reset instructions have been sent!");
      } else {
        toast.error(response.data.message || "Failed to send reset instructions.");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data.message || "Invalid email address";
        toast.error(errorMessage);
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`min-h-screen pt-24 pb-32 flex items-center justify-center px-4 transition-colors duration-500 relative overflow-hidden ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
            isDarkMode ? 'bg-[#A58077]/10' : 'bg-[#8B6B61]/5'
          }`}></div>
        </div>
        
        <div className={`max-w-md w-full rounded-2xl p-8 border backdrop-blur-xl shadow-2xl text-center transition-all duration-500 transform hover:scale-[1.02] perspective-1000 relative z-10 ${
          isDarkMode
            ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
            : 'bg-white/80 border-[#E5D3C7]'
        }`}>
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
              <FaCheckCircle className="text-green-400 text-3xl" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
            }`}>
              Check Your Email
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              If an account exists with <strong className={isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}>{email}</strong>, we've sent password reset instructions.
            </p>
          </div>

          <div className="space-y-4">
            <div className={`rounded-lg p-4 border transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#1e1e1e] border-[#3C3C3C]'
                : 'bg-white border-[#E5D3C7] shadow-md'
            }`}>
              <p className={`text-sm mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                <FaShieldAlt className="inline mr-2" />
                Didn't receive the email?
              </p>
              <ul className={`text-xs text-left space-y-1 transition-colors duration-300 ${
                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
              }`}>
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>
            
            <button
              onClick={() => setSubmitted(false)}
              className={`w-full px-6 py-3 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                  : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
              }`}
            >
              Try Another Email
            </button>
            
            <button
              onClick={() => navigate("/login")}
              className={`w-full px-6 py-3 border rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isDarkMode
                  ? 'border-[#3C3C3C] text-[#E5CBBE] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                  : 'border-[#E5D3C7] text-[#2C2C2C] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
              }`}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-32 transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`rounded-2xl p-8 border backdrop-blur-xl shadow-2xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
          isDarkMode
            ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
            : 'bg-white/80 border-[#E5D3C7]'
        }`}>
          <div className="mb-8">
            <button
              onClick={() => navigate("/login")}
              className={`flex items-center transition-all duration-200 hover:scale-105 mb-4 text-sm ${
                isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                isDarkMode
                  ? 'from-[#A58077] to-[#8B6B63]'
                  : 'from-[#8B6B61] to-[#A58077]'
              }`}>
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Forgot Password?
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  No worries, we'll send you reset instructions
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  <FaEnvelope />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoFocus
                  placeholder="Enter your email address"
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                      : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                loading 
                  ? isDarkMode
                    ? "bg-[#3C3C3C] text-[#A58077]"
                    : "bg-gray-300 text-gray-600"
                  : isDarkMode
                    ? "bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white hover:from-[#8B6B63] hover:to-[#A58077] shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-[#8B6B61] to-[#A58077] text-white hover:from-[#A58077] hover:to-[#8B6B61] shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaEnvelope />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className={`text-center text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`font-semibold underline transition-all duration-200 hover:scale-105 ${
                  isDarkMode ? 'text-[#E5CBBE] hover:text-[#A58077]' : 'text-[#2C2C2C] hover:text-[#8B6B61]'
                }`}
              >
                Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
