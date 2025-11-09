import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../utils/axiosInstance';
import { 
  FaUser, 
  FaShoppingCart, 
  FaSignOutAlt,
  FaPalette,
  FaComments,
  FaBox,
  FaChartLine,
  FaRocket,
  FaHeart,
  FaArrowRight,
  FaCog,
  FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function Dashboard() {
  const { isDarkMode } = useTheme();
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalDesigns: 0,
    totalChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      // Only fetch stats if user is authenticated
      if (!user) {
        console.log('User not authenticated, skipping stats fetch');
        setLoading(false);
        return;
      }

      try {
        // Fetch user statistics from backend
        const [ordersRes, designsRes, chatsRes] = await Promise.all([
          axiosInstance.get('/orders/user-orders'),
          axiosInstance.get('/design/user-designs'),
          axiosInstance.get('/chat/user-chats')
        ]);

        setStats({
          totalOrders: ordersRes.data?.data?.length || 0,
          totalDesigns: designsRes.data?.data?.length || 0,
          totalChats: chatsRes.data?.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Don't show error toast for stats, just use defaults
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const quickActions = [
    {
      title: 'AI Design Chat',
      description: 'Get personalized design advice',
      icon: FaComments,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      action: () => navigate('/chat')
    },
    {
      title: 'Generate Design',
      description: 'Create stunning interiors with AI',
      icon: FaPalette,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      action: () => navigate('/generate-image')
    },
    {
      title: 'Browse Products',
      description: 'Shop furniture and decor items',
      icon: FaBox,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      action: () => navigate('/products')
    },
    {
      title: 'Shopping Cart',
      description: `${getCartCount()} items in cart`,
      icon: FaShoppingCart,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      action: () => navigate('/cart')
    }
  ];

  const recentActivities = [
    {
      type: 'design',
      title: 'Modern Living Room Design',
      description: 'AI generated a new design',
      time: '2 hours ago',
      icon: FaPalette,
      color: 'text-purple-400'
    },
    {
      type: 'order',
      title: 'Order #12345',
      description: 'Your order has been shipped',
      time: '1 day ago',
      icon: FaBox,
      color: 'text-green-400'
    },
    {
      type: 'chat',
      title: 'Design Consultation',
      description: 'Chat session completed',
      time: '2 days ago',
      icon: FaComments,
      color: 'text-blue-400'
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6]'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            isDarkMode ? 'border-[#A58077]' : 'border-[#8B6B61]'
          }`}></div>
          <h1 className={`text-xl transition-colors duration-300 ${
            isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
          }`}>Loading your dashboard...</h1>
        </div>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-block mb-4">
                <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                    : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
                }`}>
                  Dashboard
                </span>
              </div>
              
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 transform hover:scale-105 transition-transform duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2C2C2C]'
              }`}>
                Welcome back,
                <span className={`block bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#A58077] via-[#E5CBBE] to-[#8B6B63]'
                    : 'bg-gradient-to-r from-[#8B6B61] via-[#A58077] to-[#8B6B61]'
                }`}>
                  {user?.firstName || user?.name?.split(' ')[0] || 'User'}!
                </span>
              </h1>
              <p className={`text-xl sm:text-2xl max-w-2xl transition-colors duration-500 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Here&apos;s what&apos;s happening with your account today
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 border transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-[#2C2C2C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] text-[#E5CBBE] hover:text-white border-[#3C3C3C] hover:border-[#A58077]'
                    : 'bg-white hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] text-[#2C2C2C] hover:text-white border-[#E5D3C7] hover:border-[#8B6B61] shadow-md'
                }`}
              >
                <FaUser className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500 transform hover:scale-105"
              >
                <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Orders", value: stats.totalOrders, desc: "Lifetime orders", icon: FaBox, gradient: "from-blue-500 to-blue-600" },
            { label: "AI Designs", value: stats.totalDesigns, desc: "Generated designs", icon: FaPalette, gradient: "from-purple-500 to-purple-600", action: () => navigate('/designs'), actionText: "View All Designs" },
            { label: "Chat Sessions", value: stats.totalChats, desc: "AI conversations", icon: FaComments, gradient: "from-green-500 to-green-600" }
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-2xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-105 perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077]/50'
                : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61]/50 shadow-lg'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>{stat.label}</p>
                  <p className={`text-3xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE] group-hover:text-white' : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
                  }`}>
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>{stat.desc}</p>
                  {stat.action && (
                    <button
                      onClick={stat.action}
                      className={`text-xs mt-2 underline transition-colors duration-200 hover:scale-105 transform ${
                        isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                      }`}
                    >
                      {stat.actionText}
                    </button>
                  )}
                </div>
                <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-xl transform hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-8 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <FaRocket className="text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                  }`}>Quick Actions</h2>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                  }`}>Get started with these popular features</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group relative overflow-hidden rounded-xl p-6 border transition-all duration-300 transform hover:scale-105 perspective-1000 ${
                      isDarkMode
                        ? 'bg-[#1e1e1e] border-[#3C3C3C] hover:border-[#A58077] hover:shadow-xl hover:shadow-[#A58077]/10'
                        : 'bg-white border-[#E5D3C7] hover:border-[#8B6B61] hover:shadow-xl hover:shadow-[#8B6B61]/10 shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`bg-gradient-to-br ${action.color} p-3 rounded-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                        <action.icon className="text-white text-xl" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`text-lg font-semibold mb-1 transition-colors duration-300 ${
                          isDarkMode ? 'text-[#E5CBBE] group-hover:text-white' : 'text-[#2C2C2C] group-hover:text-[#8B6B61]'
                        }`}>
                          {action.title}
                        </h3>
                        <p className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077] group-hover:text-[#E5CBBE]' : 'text-[#8B6B61] group-hover:text-[#2C2C2C]'
                        }`}>
                          {action.description}
                        </p>
                      </div>
                      <FaArrowRight className={`transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 ${
                        isDarkMode ? 'text-[#A58077] group-hover:text-white' : 'text-[#8B6B61] group-hover:text-[#2C2C2C]'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-6 border backdrop-blur-xl h-fit transition-all duration-500 transform hover:scale-[1.01] perspective-1000 ${
              isDarkMode
                ? 'bg-[#2C2C2C]/80 border-[#3C3C3C]'
                : 'bg-white/80 border-[#E5D3C7] shadow-lg'
            }`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-12 transition-all ${
                  isDarkMode
                    ? 'from-[#A58077] to-[#8B6B63]'
                    : 'from-[#8B6B61] to-[#A58077]'
                }`}>
                  <FaChartLine className="text-white text-sm" />
                </div>
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isDarkMode
                      ? 'hover:bg-[#1e1e1e]'
                      : 'hover:bg-white/50 border border-[#E5D3C7] shadow-md'
                  }`}>
                    <div className={`w-8 h-8 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 transform hover:rotate-12 transition-transform duration-300`}>
                      <activity.icon className={`${activity.color} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-semibold truncate transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>
                        {activity.title}
                      </h4>
                      <p className={`text-xs truncate transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        {activity.description}
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className={`w-full mt-4 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 transform ${
                isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
              }`}>
                View all activity
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FaHeart, title: "Wishlist", desc: "Save your favorite items", gradient: "from-red-500 to-red-600", action: () => navigate('/wishlist') },
            { icon: FaBox, title: "Orders", desc: "Track your purchases", gradient: "from-green-500 to-green-600", action: () => navigate('/orders') },
            { icon: FaCog, title: "Settings", desc: "Manage your account", gradient: "from-gray-500 to-gray-600", action: () => navigate('/settings') },
            { icon: FaShieldAlt, title: "Support", desc: "Get help & contact us", gradient: "from-blue-500 to-blue-600", action: () => navigate('/support') }
          ].map((feature, idx) => (
            <div
              key={idx}
              onClick={feature.action}
              className={`rounded-xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-105 perspective-1000 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077]/50'
                  : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61]/50 shadow-lg'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                }`}>{feature.title}</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                }`}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;