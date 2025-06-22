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
  FaBox
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
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Get design advice from our AI',
      icon: FaComments,
      color: 'bg-blue-500',
      action: () => navigate('/chatbot')
    },
    {
      title: 'Generate Design',
      description: 'Create new interior designs',
      icon: FaPalette,
      color: 'bg-purple-500',
      action: () => navigate('/ai')
    },
    {
      title: 'Browse Products',
      description: 'Shop for furniture and decor',
      icon: FaBox,
      color: 'bg-green-500',
      action: () => navigate('/products')
    },
    {
      title: 'View Cart',
      description: `Items in cart: ${getCartCount()}`,
      icon: FaShoppingCart,
      color: 'bg-orange-500',
      action: () => navigate('/cart')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5CBBE] mx-auto mb-4"></div>
          <h1 className="text-xl text-[#E5CBBE]">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE]">
      {/* Header */}
      <div className="bg-[#2C2C2C] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#E5CBBE]">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-[#A58077] mt-1">
                Here&apos;s what&apos;s happening with your account
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 bg-[#A58077] hover:bg-[#8B6B61] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaUser />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-[#666666] hover:bg-[#555555] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FaBox className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-[#A58077] text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-[#E5CBBE]">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <FaPalette className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-[#A58077] text-sm">Generated Designs</p>
                <p className="text-2xl font-bold text-[#E5CBBE]">{stats.totalDesigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <FaComments className="text-white text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-[#A58077] text-sm">AI Conversations</p>
                <p className="text-2xl font-bold text-[#E5CBBE]">{stats.totalChats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#E5CBBE] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-left group"
              >
                <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-[#E5CBBE] mb-2">
                  {action.title}
                </h3>
                <p className="text-[#A58077] text-sm">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#E5CBBE] mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[#A58077] text-sm">Full Name</p>
              <p className="text-[#E5CBBE] font-medium">{user?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[#A58077] text-sm">Email</p>
              <p className="text-[#E5CBBE] font-medium">{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[#A58077] text-sm">Phone</p>
              <p className="text-[#E5CBBE] font-medium">{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[#A58077] text-sm">Account Type</p>
              <p className="text-[#E5CBBE] font-medium capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;