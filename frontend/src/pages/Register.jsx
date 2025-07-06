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
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <nav className="flex items-center justify-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Register</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Join Our
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Community</span>
          </h1>
          <p className="text-[#A58077] text-lg max-w-md mx-auto">
            Create your account and start designing beautiful spaces with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left Side - Form */}
          <div className="bg-[#2C2C2C] rounded-2xl p-8 lg:p-12 border border-[#3C3C3C] shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center shadow-lg">
                  <FaUser className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Create Account</h2>
                  <p className="text-[#A58077] text-sm">Join thousands of designers</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#E5CBBE]">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-[#A58077]" />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="Enter your first name"
                      className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#E5CBBE]">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-[#A58077]" />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Enter your last name"
                      className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-[#E5CBBE]">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaPhone className="text-[#A58077]" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="e.g., 01012345678"
                    className="w-full pl-12 pr-4 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                    value={formData.phone}
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
                    placeholder="Minimum 8 characters"
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
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-[#E5CBBE]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-[#A58077]" />
                  </div>
                  <input
                    id="passwordConfirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-12 py-4 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 placeholder-[#A58077]"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200"
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
                  className="mt-1 w-4 h-4 bg-[#1e1e1e] border-[#3C3C3C] rounded focus:ring-[#A58077] focus:ring-2"
                  required
                />
                <label htmlFor="terms" className="text-sm text-[#A58077]">
                  I agree to the{" "}
                  <a href="#" className="text-[#E5CBBE] hover:text-[#A58077] underline transition-colors duration-200">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#E5CBBE] hover:text-[#A58077] underline transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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

              {/* Login Link */}
              <div className="text-center pt-6">
                <p className="text-[#A58077] text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[#E5CBBE] font-semibold hover:text-[#A58077] transition-colors duration-200 underline"
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
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-3xl font-bold text-[#E5CBBE]">
                  Start Your Design Journey
                </h3>
                <p className="text-lg text-[#A58077] leading-relaxed">
                  Join our community of designers and homeowners who are transforming spaces with AI-powered interior design.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaRocket className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">Instant Design Generation</h4>
                    <p className="text-sm text-[#A58077]">Create stunning interiors in seconds</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">Secure & Private</h4>
                    <p className="text-sm text-[#A58077]">Your designs are protected and private</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#A58077]/20 rounded-lg flex items-center justify-center">
                    <FaUser className="text-[#A58077]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#E5CBBE]">Personalized Experience</h4>
                    <p className="text-sm text-[#A58077]">Get recommendations based on your style</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C]">
                <h4 className="font-semibold text-[#E5CBBE] mb-4">What you&apos;ll get:</h4>
                <ul className="space-y-2 text-sm text-[#A58077]">
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-400" />
                    <span>Unlimited AI design generations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-400" />
                    <span>Access to premium furniture catalog</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-400" />
                    <span>Expert design consultation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCheck className="text-green-400" />
                    <span>Priority customer support</span>
                  </li>
                </ul>
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

export default SignUp;
