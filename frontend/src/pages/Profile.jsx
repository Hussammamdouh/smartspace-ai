import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import { 
  FaEdit, 
  FaHistory, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
  FaSpinner,
  FaShieldAlt,
  FaBox,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaArrowRight,
  FaCalendarAlt,
  FaDollarSign,
  FaCheckCircle
} from "react-icons/fa";

const Profile = () => {
  const { isDarkMode } = useTheme();
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || "",
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get('/orders/user-orders');
        setOrders(data.data || []);
      } catch (err) {
        console.error('Failed to load order history:', err);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setSaving(true);
    
    try {
      const updateData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim()
      };
      
      const { data } = await axiosInstance.put('/users/profile', updateData);
      
      if (data.status === 'success') {
        updateUser(data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Invalid profile data';
        toast.error(errorMessage);
      } else if (error.response?.status === 409) {
        toast.error('Email already exists. Please use a different email.');
      } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6]'
      }`}>
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-16 transition-colors duration-500 relative overflow-hidden ${
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
        <div className="mb-12">
          <nav className={`flex items-center space-x-2 text-sm mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="opacity-50">/</span>
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Profile</span>
          </nav>
          
          <div className="inline-block mb-4">
            <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
            }`}>
              My Account
            </span>
          </div>
          
          <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
          }`}>
            My
            <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
            }`}> Profile</span>
          </h1>
          <p className={`text-xl sm:text-2xl max-w-2xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-6 border backdrop-blur-xl h-fit sticky top-24 transition-all duration-500 transform hover:scale-[1.02] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              
              {/* User Avatar & Info */}
              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 hover:rotate-12 transition-all duration-500 ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <FaUser className="text-white text-2xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>
                  {user?.firstName || user?.name?.split(' ')[0] || 'User'}
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>
                  {user?.email || 'user@example.com'}
                </p>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {user?.role || 'user'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: FaBox, label: "Orders", value: orders.length },
                  { icon: FaHeart, label: "Wishlist", value: 0 }
                ].map((stat, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e]'
                      : 'bg-white border border-[#E5D3C7] shadow-md'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <stat.icon className={isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'} />
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>{stat.label}</span>
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                {[
                  { icon: FaUser, label: "Profile", active: true, onClick: null },
                  { icon: FaHistory, label: "Orders", onClick: () => navigate('/orders') },
                  { icon: FaHeart, label: "Wishlist", onClick: () => navigate('/wishlist') },
                  { icon: FaCog, label: "Settings", onClick: () => navigate('/settings') }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      item.active
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white shadow-lg'
                          : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] text-white shadow-lg'
                        : isDarkMode
                          ? 'bg-[#1e1e1e] text-[#E5CBBE] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white'
                          : 'bg-white text-[#2C2C2C] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white border border-[#E5D3C7] shadow-md'
                    }`}
                  >
                    <item.icon className="group-hover:rotate-12 transition-transform duration-300" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300 transform hover:scale-105 border border-red-500/30 hover:border-red-500"
                >
                  <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Profile Information */}
            <div className={`rounded-2xl p-8 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                    isDarkMode
                      ? 'from-[#A58077] to-[#8B6B63]'
                      : 'from-[#8B6B61] to-[#A58077]'
                  }`}>
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>Personal Information</h2>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>Update your account details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                      : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                  }`}
                >
                  {isEditing ? <FaTimes className="group-hover:rotate-90 transition-transform duration-300" /> : <FaEdit className="group-hover:rotate-12 transition-transform duration-300" />}
                  <span>{isEditing ? "Cancel" : "Edit"}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: "firstName", label: "First Name", icon: FaUser },
                      { name: "lastName", label: "Last Name", icon: FaUser }
                    ].map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className={`block text-sm font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                        }`}>{field.label}</label>
                        <div className="relative">
                          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                          }`}>
                            <field.icon />
                          </div>
                          <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                              isDarkMode
                                ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE]'
                                : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] shadow-md'
                            }`}
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {[
                    { name: "email", label: "Email Address", icon: FaEnvelope, type: "email" },
                    { name: "phone", label: "Phone Number", icon: FaPhone, type: "tel" }
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className={`block text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>{field.label}</label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          <field.icon />
                        </div>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] ${
                            isDarkMode
                              ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE]'
                              : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] shadow-md'
                          }`}
                          required={field.name === 'email'}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <label className={`block text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>Address</label>
                    <div className="relative">
                      <div className={`absolute top-3 left-4 flex items-center pointer-events-none transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        <FaMapMarkerAlt />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 transform focus:scale-[1.02] resize-none ${
                          isDarkMode
                            ? 'bg-[#1e1e1e] border-[#3C3C3C] focus:border-[#A58077] focus:ring-[#A58077]/20 text-[#E5CBBE]'
                            : 'bg-white border-[#E5D3C7] focus:border-[#8B6B61] focus:ring-[#8B6B61]/20 text-[#2C2C2C] shadow-md'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`flex items-center space-x-2 px-6 py-3 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                          : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                      }`}
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="group-hover:rotate-12 transition-transform duration-300" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 border transform hover:scale-105 ${
                        isDarkMode
                          ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                          : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", value: `${formData.firstName} ${formData.lastName}` },
                    { label: "Email", value: formData.email },
                    { label: "Phone", value: formData.phone || "Not provided" },
                    { label: "Address", value: formData.address || "Not provided" }
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-2">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>{field.label}</span>
                      <p className={`text-lg transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className={`rounded-2xl p-8 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                    isDarkMode
                      ? 'from-[#A58077] to-[#8B6B63]'
                      : 'from-[#8B6B61] to-[#A58077]'
                  }`}>
                    <FaHistory className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                    }`}>Recent Orders</h2>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>Your latest purchases</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/orders')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                    isDarkMode
                      ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                      : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                  }`}
                >
                  <span>View All</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-300 ${
                    isDarkMode ? 'bg-[#A58077]/20' : 'bg-[#8B6B61]/20'
                  }`}>
                    <FaBox className={`text-4xl ${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>No Orders Yet</h3>
                  <p className={`mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>Start shopping to see your order history here</p>
                  <button 
                    onClick={() => navigate('/products')}
                    className={`px-6 py-3 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                        : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
                    }`}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 perspective-1000 ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] hover:border-[#A58077]/50'
                        : 'bg-white border-[#E5D3C7] hover:border-[#8B6B61]/50 shadow-md'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                          isDarkMode
                            ? 'from-[#A58077] to-[#8B6B63]'
                            : 'from-[#8B6B61] to-[#A58077]'
                        }`}>
                          <span className="text-white font-semibold">#{order._id?.slice(-4) || index + 1}</span>
                        </div>
                        <div>
                          <p className={`font-semibold transition-colors duration-300 ${
                            isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                          }`}>
                            Order #{order._id?.slice(-6) || index + 1}
                          </p>
                          <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                          }`}>
                            <span className="flex items-center space-x-1">
                              <FaCalendarAlt />
                              <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaDollarSign />
                              <span>${order.total?.toFixed(2) || '0.00'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                        <button className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-12 ${
                          isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                        }`}>
                          <FaArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
