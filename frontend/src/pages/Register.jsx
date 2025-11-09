import { useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaApple, 
  FaFacebookF,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaArrowRight,
  FaSpinner,
  FaShieldAlt,
  FaRocket,
  FaCheck
} from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";

const SignUp = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    role: "user"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required!");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    // Egyptian phone number validation
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid Egyptian phone number!");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        role: formData.role
      });
      
      if (response.data.status === 'success') {
        // Use the login method from AuthContext
        await login(
          response.data.data.user,
          response.data.token,
          response.data.refreshToken
        );
        
        toast.success("Account created successfully! Welcome to AI Interior Design!");
        navigate("/dashboard"); // Navigate to dashboard instead of login
      } else {
        toast.error(response.data.message || "An error occurred while registering.");
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorMessage = err.response.data.message || "Invalid registration data";
        toast.error(errorMessage);
      } else if (err.response?.status === 409) {
        toast.error("Email already exists. Please use a different email or try logging in.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (password.length === 0) return { score: 0, color: 'text-[#A58077]', text: '' };
    if (password.length < 8) return { score: 1, color: 'text-red-400', text: 'Weak' };
    if (password.length < 12) return { score: 2, color: 'text-yellow-400', text: 'Fair' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { score: 3, color: 'text-green-400', text: 'Strong' };
    return { score: 2, color: 'text-yellow-400', text: 'Fair' };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className={`min-h-screen pt-24 pb-32 transition-colors duration-500 relative overflow-hidden ${
      isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <nav className={`flex items-center justify-center space-x-2 text-sm mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="opacity-50">/</span>
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Register</span>
          </nav>
          
          <div className="inline-block mb-4">
            <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
            }`}>
              Join Us
            </span>
          </div>
          
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
          }`}>
            Join Our
            <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
            }`}> Community</span>
          </h1>
          <p className={`text-xl sm:text-2xl max-w-md mx-auto transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Create your account and start designing beautiful spaces with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left Side - Form */}
          <div className={`rounded-2xl p-8 lg:p-12 border backdrop-blur-xl shadow-2xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
            isDarkMode
              ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
              : 'bg-white/80 border-[#E5D3C7]'
          }`}>
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>Create Account</h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>Join thousands of designers</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className={`block text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>
                    First Name
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>
                      <FaUser />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="Enter your first name"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                        isDarkMode
                          ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                          : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                      }`}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className={`block text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>
                    Last Name
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>
                      <FaUser />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Enter your last name"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                        isDarkMode
                          ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                          : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                      }`}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className={`block text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
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
                    placeholder="Enter your email address"
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                        : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className={`block text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    <FaPhone />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="e.g., 01012345678"
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                        : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                    }`}
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className={`block text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    <FaLock />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 8 characters"
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                        : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                    }`}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-200 hover:scale-110 ${
                      isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle Password Visibility"
                  >
                    {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={strength.color}>{strength.text}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= strength.score 
                              ? strength.score === 1 ? 'bg-red-400' 
                              : strength.score === 2 ? 'bg-yellow-400' 
                              : 'bg-green-400'
                              : 'bg-[#3C3C3C]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="passwordConfirm" className={`block text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    <FaLock />
                  </div>
                  <input
                    id="passwordConfirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    placeholder="Confirm your password"
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE] placeholder-[#A58077]'
                        : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] placeholder-[#8B6B61] shadow-md'
                    }`}
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-200 hover:scale-110 ${
                      isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                    }`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle Password Visibility"
                  >
                    {showConfirmPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.passwordConfirm && (
                  <div className="flex items-center space-x-2 text-sm">
                    {formData.password === formData.passwordConfirm ? (
                      <>
                        <FaCheck className="text-green-400" />
                        <span className="text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                        <span className="text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={`mt-1 w-4 h-4 rounded focus:ring-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:ring-[#A58077] text-[#A58077]'
                      : 'bg-white border-[#E5D3C7] focus:ring-[#8B6B61] text-[#8B6B61]'
                  }`}
                  required
                />
                <label htmlFor="terms" className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  I agree to the{" "}
                  <a href="#" className={`underline transition-all duration-200 hover:scale-105 ${
                    isDarkMode ? 'text-[#E5CBBE] hover:text-[#A58077]' : 'text-[#2C2C2C] hover:text-[#8B6B61]'
                  }`}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className={`underline transition-all duration-200 hover:scale-105 ${
                    isDarkMode ? 'text-[#E5CBBE] hover:text-[#A58077]' : 'text-[#2C2C2C] hover:text-[#8B6B61]'
                  }`}>
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className={`w-full py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className={`flex-grow border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
                }`} />
                <span className={`mx-4 text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>or continue with</span>
                <div className={`flex-grow border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
                }`} />
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <SocialButton Icon={FaGoogle} label="Google" isDarkMode={isDarkMode} />
                <SocialButton Icon={FaApple} label="Apple" isDarkMode={isDarkMode} />
                <SocialButton Icon={FaFacebookF} label="Facebook" isDarkMode={isDarkMode} />
              </div>

              {/* Login Link */}
              <div className="text-center pt-6">
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className={`font-semibold underline transition-all duration-200 hover:scale-105 ${
                      isDarkMode ? 'text-[#E5CBBE] hover:text-[#A58077]' : 'text-[#2C2C2C] hover:text-[#8B6B61]'
                    }`}
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Info */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left space-y-8">
              
              {/* Welcome Message */}
              <div className="space-y-4">
                <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-300">🚀</div>
                <h3 className={`text-3xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Start Your Design Journey
                </h3>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  Join our community of designers and homeowners who are transforming spaces with AI-powered interior design.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: FaRocket, title: "Instant Design Generation", desc: "Create stunning interiors in seconds" },
                  { icon: FaShieldAlt, title: "Secure & Private", desc: "Your designs are protected and private" },
                  { icon: FaUser, title: "Personalized Experience", desc: "Get recommendations based on your style" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3 group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                      isDarkMode ? 'bg-[#A58077]/20' : 'bg-[#8B6B61]/20'
                    }`}>
                      <feature.icon className={isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} />
                    </div>
                    <div>
                      <h4 className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>{feature.title}</h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className={`rounded-xl p-6 border transition-all duration-500 transform hover:scale-[1.02] ${
                isDarkMode
                  ? 'bg-[#2C2C2C] border-[#3C3C3C]'
                  : 'bg-white border-[#E5D3C7] shadow-lg'
              }`}>
                <h4 className={`font-semibold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>What you&apos;ll get:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    "Unlimited AI design generations",
                    "Access to premium furniture catalog",
                    "Expert design consultation",
                    "Priority customer support"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <FaCheck className="text-green-400" />
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ Icon, label, isDarkMode }) => (
  <button
    type="button"
    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300 border transform hover:scale-105 hover:rotate-1 ${
      isDarkMode
        ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
        : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
    }`}
  >
    <Icon size={16} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

SocialButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default SignUp;
