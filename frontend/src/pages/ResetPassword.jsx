import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";


const ResetPassword = () => {
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error("Invalid reset link");
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.password.trim() || !formData.passwordConfirm.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.patch(`/auth/resetPassword/${token}`, {
        password: formData.password,
        passwordConfirm: formData.passwordConfirm
      });

      if (response.data.status === 'success') {
        toast.success("Password reset successfully! You can now log in with your new password.");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error('Reset password error:', err);
      
      if (err.response?.status === 400) {
        const errorMessage = err.response.data.message || "Invalid password data";
        toast.error(errorMessage);
      } else if (err.response?.status === 401) {
        toast.error("Reset link has expired or is invalid. Please request a new one.");
        setTokenValid(false);
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative px-4 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

        <div className="z-10 w-full max-w-lg bg-[var(--surface)] bg-opacity-90 rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 animate-fade-in text-center">
          <div className="mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#181818] mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-[#616161] text-xs md:text-sm">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-[#181818] text-white rounded-lg hover:bg-[#3a3a3a] transition-all duration-200 text-sm md:text-base"
            >
              Request New Reset Link
            </button>
            
            <button
              onClick={() => navigate("/login")}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-[#181818] text-[#181818] rounded-lg hover:bg-[#181818] hover:text-white transition-all duration-200 text-sm md:text-base"
            >
              Back to Login
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
            Back to Login
          </button>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#181818] text-center mb-2">
            Reset Your Password
          </h1>
          <p className="text-[#616161] text-center text-xs md:text-sm">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your new password"
              className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 bg-[var(--surface)] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C] text-sm md:text-base"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 md:right-3 flex items-center text-[#616161] hover:text-[#A58077]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
            </button>
          </div>

          <div className="relative">
            <label
              htmlFor="passwordConfirm"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="passwordConfirm"
              type={showConfirmPassword ? "text" : "password"}
              name="passwordConfirm"
              placeholder="Confirm your new password"
              className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 bg-[var(--surface)] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C] text-sm md:text-base"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 md:right-3 flex items-center text-[#616161] hover:text-[#A58077]"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle Password Visibility"
            >
              {showConfirmPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
            </button>
          </div>

          <div className="text-xs text-[#616161]">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>

          <button
            type="submit"
            className={`w-full h-12 md:h-14 rounded-lg text-base md:text-lg font-semibold text-white transition-all duration-200 ${
              loading ? "bg-[#A09C9C] cursor-not-allowed" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 