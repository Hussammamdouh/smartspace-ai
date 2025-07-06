import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";


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
        toast.success("Password reset instructions sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to send reset instructions.");
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        toast.error("No account found with this email address.");
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative px-4 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

        <div className="z-10 w-full max-w-lg bg-[var(--surface)] bg-opacity-90 rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 animate-fade-in text-center">
          <div className="mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#181818] mb-2">
              {''}
            </h1>
            <p className="text-[#616161] text-xs md:text-sm">
              {''} <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <p className="text-[#616161] text-xs md:text-sm">
              {''}
            </p>
            
            <button
              onClick={() => setSubmitted(false)}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#181818] text-white rounded-lg hover:bg-[#3a3a3a] transition-all duration-200 text-sm md:text-base"
            >
              {''}
            </button>
            
            <button
              onClick={() => navigate("/login")}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-[#181818] text-[#181818] rounded-lg hover:bg-[#181818] hover:text-white transition-all duration-200 text-sm md:text-base"
            >
              {''}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      <div className="z-10 w-full max-w-lg bg-[var(--surface)] bg-opacity-90 rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 animate-fade-in">
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center text-[#616161] hover:text-[#181818] transition-colors mb-3 md:mb-4 text-sm"
          >
            <FaArrowLeft className="mr-2" />
            {''}
          </button>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#181818] text-center mb-2">
            {'Forgot Password?'}
          </h1>
          <p className="text-[#616161] text-center text-xs md:text-sm">
            {''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              {'Email Address'}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoFocus
              placeholder={''}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-[var(--surface)] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C] text-sm md:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full h-12 md:h-14 rounded-lg text-base md:text-lg font-semibold text-white transition-all duration-200 ${
              loading ? "bg-[#A09C9C] cursor-not-allowed" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : ''}
          </button>

          <div className="text-center text-xs md:text-sm text-[#616161]">
            {''} {" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#181818] font-medium underline hover:text-[#A58077] transition"
            >
              {''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 