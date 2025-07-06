import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
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
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Profile</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            My
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Profile</span>
          </h1>
          <p className="text-[#A58077] text-lg">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] h-fit sticky top-24">
              
              {/* User Avatar & Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-[#E5CBBE] mb-1">
                  {user?.firstName || user?.name?.split(' ')[0] || 'User'}
                </h3>
                <p className="text-sm text-[#A58077]">
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
                <div className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaBox className="text-[#A58077]" />
                    <span className="text-sm text-[#E5CBBE]">Orders</span>
                  </div>
                  <span className="text-sm font-semibold text-[#A58077]">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaHeart className="text-[#A58077]" />
                    <span className="text-sm text-[#E5CBBE]">Wishlist</span>
                  </div>
                  <span className="text-sm font-semibold text-[#A58077]">0</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 bg-[#A58077] text-white rounded-lg">
                  <FaUser />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center space-x-3 p-3 bg-[#1e1e1e] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300"
                >
                  <FaHistory />
                  <span>Orders</span>
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center space-x-3 p-3 bg-[#1e1e1e] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300"
                >
                  <FaHeart />
                  <span>Wishlist</span>
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center space-x-3 p-3 bg-[#1e1e1e] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300"
                >
                  <FaCog />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 bg-[#1e1e1e] text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Profile Information */}
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#E5CBBE]">Personal Information</h2>
                    <p className="text-[#A58077] text-sm">Update your account details</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                >
                  {isEditing ? <FaTimes /> : <FaEdit />}
                  <span>{isEditing ? "Cancel" : "Edit"}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#E5CBBE]">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-[#A58077]" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[#E5CBBE]">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-[#A58077]" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-[#A58077]" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="text-[#A58077]" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#E5CBBE]">Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-4 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-[#A58077]" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full pl-12 pr-4 py-3 bg-[#1e1e1e] border border-[#3C3C3C] rounded-xl focus:outline-none focus:border-[#A58077] focus:ring-2 focus:ring-[#A58077]/20 text-[#E5CBBE] transition-all duration-300 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-[#1e1e1e] text-[#E5CBBE] rounded-xl hover:bg-[#A58077] hover:text-white transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-sm text-[#A58077] font-medium">Full Name</span>
                    <p className="text-lg text-[#E5CBBE]">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-[#A58077] font-medium">Email</span>
                    <p className="text-lg text-[#E5CBBE]">{formData.email}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-[#A58077] font-medium">Phone</span>
                    <p className="text-lg text-[#E5CBBE]">
                      {formData.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-[#A58077] font-medium">Address</span>
                    <p className="text-lg text-[#E5CBBE]">
                      {formData.address || "Not provided"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                    <FaHistory className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#E5CBBE]">Recent Orders</h2>
                    <p className="text-[#A58077] text-sm">Your latest purchases</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/orders')}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] hover:bg-[#A58077] hover:text-white rounded-lg transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
                >
                  <span>View All</span>
                  <FaArrowRight />
                </button>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <FaBox className="text-4xl text-[#A58077] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">No Orders Yet</h3>
                  <p className="text-[#A58077] mb-4">Start shopping to see your order history here</p>
                  <button 
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold">#{order._id?.slice(-4) || index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#E5CBBE]">
                            Order #{order._id?.slice(-6) || index + 1}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-[#A58077]">
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
                        <button className="p-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
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
