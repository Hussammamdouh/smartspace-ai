import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData
      );
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/"); // Redirect after login
    } catch (err) {
      setError(err.response?.data?.message || "Error logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center relative px-4 overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      {/* Login Card */}
      <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-[#181818] text-center mb-6">
          Login to SmartSpace AI
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#616161] text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-[#616161] text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full px-4 py-3 pr-12 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition"
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

          <button
            type="submit"
            className={`w-full h-14 rounded-lg text-lg font-semibold text-white transition ${
              loading ? "bg-[#A09C9C]" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#A09C9C]" />
            <span className="mx-4 text-[#616161]">or</span>
            <div className="flex-grow border-t border-[#A09C9C]" />
          </div>

          {/* Social Login */}
          <div className="flex justify-center space-x-4">
            <SocialButton Icon={FaGoogle} />
            <SocialButton Icon={FaApple} />
            <SocialButton Icon={FaFacebookF} />
          </div>

          {/* Register link */}
          <div className="mt-6 text-center text-sm text-[#616161]">
            Don’t have an account?{" "}
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
  <button className="w-10 h-10 bg-[#181818] text-white flex items-center justify-center rounded-full hover:bg-[#A58077] transition transform hover:scale-105">
    <Icon size={18} />
  </button>
);

export default Login;
