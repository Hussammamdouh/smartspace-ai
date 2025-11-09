import { useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <nav className="flex items-center justify-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Login</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Welcome
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Back</span>
          </h1>
          <p className="text-[#A58077] text-lg max-w-md mx-auto">
            Sign in to your account to continue designing beautiful spaces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Side - Form */}
          <div className="bg-[#2C2C2C] rounded-2xl p-8 lg:p-12 border border-[#3C3C3C] shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center shadow-lg">
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Sign In</h2>
                  <p className="text-[#A58077] text-sm">Access your account</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#E5CBBE]">
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
                    className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#E5CBBE]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-[#A58077]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200"
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
                    className="w-4 h-4 bg-[#1e1e1e] border-[#3C3C3C] rounded focus:ring-[#A58077] focus:ring-2 text-[#A58077]"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-[#A58077]">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#A58077] hover:text-[#E5CBBE] underline transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-grow border-t border-[#3C3C3C]" />
                <span className="mx-4 text-[#A58077] text-sm">or continue with</span>
                <div className="flex-grow border-t border-[#3C3C3C]" />
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <SocialButton Icon={FaGoogle} label="Google" />
                <SocialButton Icon={FaApple} label="Apple" />
                <SocialButton Icon={FaFacebookF} label="Facebook" />
              </div>

              {/* Register Link */}
              <div className="text-center pt-6">
                <p className="text-[#A58077] text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-[#E5CBBE] font-semibold hover:text-[#A58077] transition-colors duration-200 underline"
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
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-3xl font-bold text-[#E5CBBE]">
                  Transform Your Space with AI
                </h3>
                <p className="text-lg text-[#A58077] leading-relaxed">
                  Join thousands of users who are already creating stunning interior designs with our AI-powered platform.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaRocket className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">AI-Powered Design</h4>
                    <p className="text-sm text-[#A58077]">Generate stunning interiors in minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">Secure & Private</h4>
                    <p className="text-sm text-[#A58077]">Your data is protected with enterprise security</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaUser className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">Personalized Experience</h4>
                    <p className="text-sm text-[#A58077]">Get recommendations tailored to your style</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E5CBBE]">10K+</div>
                  <div className="text-sm text-[#A58077]">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E5CBBE]">50K+</div>
                  <div className="text-sm text-[#A58077]">Designs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E5CBBE]">4.9★</div>
                  <div className="text-sm text-[#A58077]">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ Icon, label }) => (
  <button
    type="button"
    className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
  >
    <Icon size={16} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

SocialButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

export default Login;
