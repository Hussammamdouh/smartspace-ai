import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaArrowLeft, FaLock, FaCheck, FaTimes } from "react-icons/fa";

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

  const validatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return checks;
  };

  const passwordChecks = validatePasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.passwordConfirm && formData.passwordConfirm.length > 0;
  const isPasswordValid = Object.values(passwordChecks).every(check => check);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.password.trim() || !formData.passwordConfirm.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password does not meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match");
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
        setTimeout(() => navigate("/login"), 2000);
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
      } else if (err.response?.status === 429) {
        toast.error("Too many attempts. Please try again later.");
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
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C] shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-red-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-[#E5CBBE]">
              Invalid Reset Link
            </h1>
            <p className="text-[#A58077] text-lg">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold"
            >
              Request New Reset Link
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
                <FaLock className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#E5CBBE]">
                  Reset Password
                </h1>
                <p className="text-[#A58077] text-sm">
                  Enter your new password below
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#E5CBBE] mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-[#A58077]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your new password"
                  className="w-full pl-12 pr-12 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 focus:border-[#A58077] text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A58077] hover:text-[#E5CBBE] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className={`flex items-center space-x-2 ${passwordChecks.length ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordChecks.length ? <FaCheck /> : <FaTimes />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordChecks.uppercase ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordChecks.uppercase ? <FaCheck /> : <FaTimes />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordChecks.lowercase ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordChecks.lowercase ? <FaCheck /> : <FaTimes />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordChecks.number ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordChecks.number ? <FaCheck /> : <FaTimes />}
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordChecks.special ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordChecks.special ? <FaCheck /> : <FaTimes />}
                    <span>One special character</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-medium text-[#E5CBBE] mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-[#A58077]" />
                </div>
                <input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  name="passwordConfirm"
                  placeholder="Confirm your new password"
                  className={`w-full pl-12 pr-12 py-4 bg-[#1e1e1e] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077] ${
                    formData.passwordConfirm 
                      ? passwordsMatch 
                        ? 'border-green-500 focus:border-green-500' 
                        : 'border-red-500 focus:border-red-500'
                      : 'border-[#3C3C3C] focus:border-[#A58077]'
                  }`}
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A58077] hover:text-[#E5CBBE] transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  {showConfirmPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.passwordConfirm && (
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  {passwordsMatch ? (
                    <>
                      <FaCheck className="text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="text-red-400" />
                      <span className="text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || !isPasswordValid || !passwordsMatch
                  ? "bg-[#3C3C3C] text-[#A58077] cursor-not-allowed" 
                  : "bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white hover:from-[#8B6B63] hover:to-[#A58077] shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <FaLock />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
