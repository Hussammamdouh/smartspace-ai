import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email) {
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/forgotPassword`,
        { email }
      );

      if (response.data.status === 'success') {
        setSubmitted(true);
        toast.success("Password reset instructions sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to send reset instructions.");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        toast.error("No account found with this email address.");
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
      <div className="min-h-screen bg-[#181818] flex items-center justify-center relative px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

        <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#181818] mb-2">
              Check Your Email
            </h1>
            <p className="text-[#616161] text-sm">
              We&apos;ve sent password reset instructions to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[#616161] text-sm">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            
            <button
              onClick={() => setSubmitted(false)}
              className="w-full px-4 py-3 bg-[#181818] text-white rounded-lg hover:bg-[#3a3a3a] transition-all duration-200"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-3 border border-[#181818] text-[#181818] rounded-lg hover:bg-[#181818] hover:text-white transition-all duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center relative px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <div className="mb-6">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center text-[#616161] hover:text-[#181818] transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Login
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-[#181818] text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-[#616161] text-center text-sm">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoFocus
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full h-14 rounded-lg text-lg font-semibold text-white transition-all duration-200 ${
              loading ? "bg-[#A09C9C] cursor-not-allowed" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>

          <div className="text-center text-sm text-[#616161]">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#181818] font-medium underline hover:text-[#A58077] transition"
            >
              Sign in here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 