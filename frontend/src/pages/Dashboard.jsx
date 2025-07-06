import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
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
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A58077] mx-auto mb-4"></div>
          <h1 className="text-xl text-[#E5CBBE]">Loading your dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                Welcome back,
                <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent">
                  {user?.firstName || user?.name?.split(' ')[0] || 'User'}!
                </span>
              </h1>
              <p className="text-[#A58077] text-lg">
                Here&apos;s what&apos;s happening with your account today
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-[#2C2C2C] hover:bg-[#A58077] text-[#E5CBBE] hover:text-white px-4 py-3 rounded-xl transition-all duration-300 border border-[#3C3C3C] hover:border-[#A58077]"
              >
                <FaUser />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-[#2C2C2C] hover:bg-red-500 text-[#E5CBBE] hover:text-white px-4 py-3 rounded-xl transition-all duration-300 border border-[#3C3C3C] hover:border-red-500"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A58077] text-sm font-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalOrders}
                </p>
                <p className="text-xs text-[#A58077] mt-1">Lifetime orders</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaBox className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A58077] text-sm font-medium mb-1">AI Designs</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalDesigns}
                </p>
                <p className="text-xs text-[#A58077] mt-1">Generated designs</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaPalette className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A58077] text-sm font-medium mb-1">Chat Sessions</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalChats}
                </p>
                <p className="text-xs text-[#A58077] mt-1">AI conversations</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaComments className="text-white text-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-[#2C2C2C] rounded-2xl p-8 border border-[#3C3C3C]">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#E5CBBE]">Quick Actions</h2>
                  <p className="text-[#A58077] text-sm">Get started with these popular features</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="group relative overflow-hidden bg-[#1e1e1e] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077] transition-all duration-300 hover:shadow-xl hover:shadow-[#A58077]/10"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="text-white text-xl" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-[#E5CBBE] group-hover:text-white transition-colors duration-300 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-[#A58077] group-hover:text-[#E5CBBE] transition-colors duration-300">
                          {action.description}
                        </p>
                      </div>
                      <FaArrowRight className="text-[#A58077] group-hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] h-fit">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-sm" />
                </div>
                <h3 className="text-xl font-bold text-[#E5CBBE]">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[#1e1e1e] transition-colors duration-200">
                    <div className={`w-8 h-8 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`${activity.color} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#E5CBBE] truncate">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-[#A58077] truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-[#A58077] mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 text-sm text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
                View all activity
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/wishlist')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaHeart className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">Wishlist</h3>
              <p className="text-sm text-[#A58077]">Save your favorite items</p>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/orders')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaBox className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">Orders</h3>
              <p className="text-sm text-[#A58077]">Track your purchases</p>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/settings')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaCog className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">Settings</h3>
              <p className="text-sm text-[#A58077]">Manage your account</p>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/support')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">Support</h3>
              <p className="text-sm text-[#A58077]">Get help & contact us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;