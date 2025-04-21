import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      alert("Account created successfully!");
      navigate("/login"); // ✅ after success
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while registering.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      {/* Form Container */}
      <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-[#181818] text-center mb-6">Create your account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </div>

          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
          <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            show={showPassword}
            toggleVisibility={() => setShowPassword(!showPassword)}
            onChange={handleInputChange}
          />
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            show={showConfirmPassword}
            toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={handleInputChange}
          />

          <div className="text-sm text-[#616161] mb-4">
            <label className="flex items-start gap-2">
              <input type="checkbox" required className="form-checkbox bg-[#181818] border-black text-black rounded focus:ring-black" />
              <span>
                I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full h-14 rounded-lg text-lg font-semibold transition text-white ${
              loading ? "bg-[#A09C9C]" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="flex justify-center mt-6 space-x-4">
          <SocialButton Icon={FaGoogle} />
          <SocialButton Icon={FaApple} />
          <SocialButton Icon={FaFacebookF} />
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-[#616161] text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      className="w-full px-4 py-3 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

const PasswordInput = ({ label, name, value, show, toggleVisibility, onChange }) => (
  <div className="relative">
    <label className="block text-[#616161] text-sm font-medium mb-1">{label}</label>
    <input
      type={show ? "text" : "password"}
      name={name}
      className="w-full px-4 py-3 pr-12 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200"
      value={value}
      onChange={onChange}
      required
    />
    <button
      type="button"
      onClick={toggleVisibility}
      className="absolute inset-y-0 right-3 flex items-center text-[#616161] hover:text-[#181818]"
      aria-label="Toggle password visibility"
    >
      {show ? <FaEye /> : <FaEyeSlash />}
    </button>
  </div>
);

const SocialButton = ({ Icon }) => (
  <button className="w-10 h-10 bg-[#181818] text-white flex items-center justify-center rounded-full hover:bg-[#A58077] transition-all duration-200 transform hover:scale-105">
    <Icon size={18} />
  </button>
);

export default SignUp;
