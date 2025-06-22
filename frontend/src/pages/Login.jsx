import { useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaApple,
  FaFacebookF,
} from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', formData);

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
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorMessage = err.response.data.message || "Invalid login data";
        toast.error(errorMessage);
      } else if (err.response?.status === 401) {
        toast.error("Invalid email or password. Please check your credentials.");
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
    <div className="min-h-screen bg-[#181818] flex items-center justify-center relative px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-[#181818] text-center mb-6">
          Login to AI Interior Design
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoFocus
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C]"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-[#616161] text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-12 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C]"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-[#616161] hover:text-[#181818]"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#616161] hover:text-[#181818] underline transition-colors"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            className={`w-full h-14 rounded-lg text-lg font-semibold text-white transition-all duration-200 ${
              loading ? "bg-[#A09C9C] cursor-not-allowed" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#A09C9C]" />
            <span className="mx-4 text-[#616161]">or</span>
            <div className="flex-grow border-t border-[#A09C9C]" />
          </div>

          <div className="flex justify-center space-x-4">
            <SocialButton Icon={FaGoogle} />
            <SocialButton Icon={FaApple} />
            <SocialButton Icon={FaFacebookF} />
          </div>

          <div className="mt-6 text-center text-sm text-[#616161]">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#181818] font-medium underline hover:text-[#A58077] transition"
            >
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SocialButton = ({ Icon }) => (
  <button
    type="button"
    className="w-10 h-10 bg-[#181818] text-white flex items-center justify-center rounded-full hover:bg-[#A58077] transition-all duration-200 transform hover:scale-105"
    aria-label="Login with social"
  >
    <Icon size={18} />
  </button>
);

SocialButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
};

export default Login;
