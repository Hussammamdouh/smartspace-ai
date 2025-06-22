import { useState, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";

const SignUp = () => {
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
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
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

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path-to-image.jpg')] bg-cover opacity-20 z-0" />

      <div className="z-10 w-full max-w-lg bg-[#E5CBBE] bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-10 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-[#181818] text-center mb-6">Create your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange}
              placeholder="Enter your first name"
            />
            <Input 
              label="Last Name" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange}
              placeholder="Enter your last name"
            />
          </div>

          <Input 
            label="Email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleInputChange}
            placeholder="Enter your email address"
          />
          <Input 
            label="Phone Number" 
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={handleInputChange}
            placeholder="e.g., 01012345678"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            show={showPassword}
            toggleVisibility={() => setShowPassword(!showPassword)}
            onChange={handleInputChange}
            placeholder="Minimum 8 characters"
          />
          <PasswordInput
            label="Confirm Password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            show={showConfirmPassword}
            toggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={handleInputChange}
            placeholder="Confirm your password"
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
              loading ? "bg-[#A09C9C] cursor-not-allowed" : "bg-[#181818] hover:bg-[#3a3a3a]"
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#616161] text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-[#181818] font-semibold hover:underline">
              Sign in here
            </a>
          </p>
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <SocialButton Icon={FaGoogle} />
          <SocialButton Icon={FaApple} />
          <SocialButton Icon={FaFacebookF} />
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-[#616161] text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C]"
      required
    />
  </div>
);

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const PasswordInput = ({ label, name, value, show, toggleVisibility, onChange, placeholder }) => (
  <div>
    <label className="block text-[#616161] text-sm font-medium mb-1">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-12 bg-[#E5CBBE] border border-[#A09C9C] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077] text-[#181818] transition-all duration-200 placeholder-[#A09C9C]"
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-3 flex items-center text-[#616161] hover:text-[#181818]"
        onClick={toggleVisibility}
        aria-label="Toggle Password Visibility"
      >
        {show ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>
  </div>
);

PasswordInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  toggleVisibility: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

const SocialButton = ({ Icon }) => (
  <button
    type="button"
    className="w-10 h-10 bg-[#181818] text-white flex items-center justify-center rounded-full hover:bg-[#A58077] transition-all duration-200 transform hover:scale-105"
    aria-label="Sign up with social"
  >
    <Icon size={18} />
  </button>
);

SocialButton.propTypes = {
  Icon: PropTypes.elementType.isRequired,
};

export default SignUp;
