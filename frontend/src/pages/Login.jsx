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
  FaArrowRight,
  FaSpinner,
  FaShieldAlt,
  FaUser,
  FaRocket
} from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (formData.password.length < 1) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });
      const response = await axiosInstance.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      console.log('Login response:', response.data);

      if (response.data.status === 'success') {
        // Use the login method from AuthContext
        await login(
          response.data.data.user,
          response.data.token,
          response.data.refreshToken
        );

        toast.success("Login successful! Welcome back!");
    
        // Navigate based on user role
        if (response.data.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorMessage = err.response.data.message || "Invalid login data";
        toast.error(errorMessage);
      } else if (err.response?.status === 401) {
        const errorMessage = err.response.data.message || "Invalid email or password. Please check your credentials.";
        toast.error(errorMessage);
      } else if (err.response?.status === 423) {
        toast.error("Account is locked. Please try again later.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

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
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Login</span>
          </nav>
          
          <div className="inline-block mb-4">
            <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
            }`}>
              Welcome Back
            </span>
          </div>
          
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
          }`}>
            Welcome
            <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
            }`}> Back</span>
          </h1>
          <p className={`text-xl sm:text-2xl max-w-md mx-auto transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sign in to your account to continue designing beautiful spaces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
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
                  }`}>Sign In</h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>Access your account</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
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
                    autoFocus
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
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className={`w-4 h-4 rounded focus:ring-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:ring-[#A58077] text-[#A58077]'
                        : 'bg-white border-[#E5D3C7] focus:ring-[#8B6B61] text-[#8B6B61]'
                    }`}
                  />
                  <label htmlFor="rememberMe" className={`ml-2 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={`text-sm underline transition-all duration-200 hover:scale-105 ${
                    isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                  }`}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                    : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
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

              {/* Register Link */}
              <div className="text-center pt-6">
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className={`font-semibold underline transition-all duration-200 hover:scale-105 ${
                      isDarkMode ? 'text-[#E5CBBE] hover:text-[#A58077]' : 'text-[#2C2C2C] hover:text-[#8B6B61]'
                    }`}
                  >
                    Create one now
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
                <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-300">🎨</div>
                <h3 className={`text-3xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  Transform Your Space with AI
                </h3>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  Join thousands of users who are already creating stunning interior designs with our AI-powered platform.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: FaRocket, title: "AI-Powered Design", desc: "Generate stunning interiors in minutes" },
                  { icon: FaShieldAlt, title: "Secure & Private", desc: "Your data is protected with enterprise security" },
                  { icon: FaUser, title: "Personalized Experience", desc: "Get recommendations tailored to your style" }
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { value: "10K+", label: "Happy Users" },
                  { value: "50K+", label: "Designs Created" },
                  { value: "4.9★", label: "User Rating" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>{stat.value}</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>{stat.label}</div>
                  </div>
                ))}
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

export default Login;
