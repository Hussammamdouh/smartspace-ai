import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { 
  FaEnvelope, 
  FaArrowLeft, 
  FaSpinner,
  FaCheckCircle,
  FaShieldAlt
} from "react-icons/fa";

const ForgotPassword = () => {
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
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C] shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#E5CBBE]">
              Check Your Email
            </h1>
            <p className="text-[#A58077] text-lg">
              If an account exists with <strong className="text-[#E5CBBE]">{email}</strong>, we've sent password reset instructions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#3C3C3C]">
              <p className="text-sm text-[#A58077] mb-2">
                <FaShieldAlt className="inline mr-2" />
                Didn't receive the email?
              </p>
              <ul className="text-xs text-[#A58077] text-left space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>
            
            <button
              onClick={() => setSubmitted(false)}
              className="w-full px-6 py-3 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
            >
              Try Another Email
            </button>
            
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 border border-[#3C3C3C] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white hover:border-[#A58077] transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C] shadow-2xl">
          <div className="mb-8">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center text-[#A58077] hover:text-[#E5CBBE] transition-colors mb-4 text-sm"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center shadow-lg">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#E5CBBE]">
                  Forgot Password?
                </h1>
                <p className="text-[#A58077] text-sm">
                  No worries, we'll send you reset instructions
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#E5CBBE] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-[#A58077]" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoFocus
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 focus:border-[#A58077] text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading 
                  ? "bg-[#3C3C3C] text-[#A58077] cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white hover:from-[#8B6B63] hover:to-[#A58077] shadow-lg hover:shadow-xl transform hover:scale-105"
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

            <div className="text-center text-sm text-[#A58077]">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#E5CBBE] font-semibold underline hover:text-[#A58077] transition-colors"
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
