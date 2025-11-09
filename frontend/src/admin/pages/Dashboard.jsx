import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaBoxes, 
  FaShoppingCart, 
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaGift,
} from "react-icons/fa";
import { CardSkeleton } from "../components/SkeletonLoader";
import { formatCurrency, formatDate, getStatusColor } from "../utils/helpers";
import "chart.js/auto";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyData: [],
    categoryDistribution: [],
    growth: {
      users: '0',
      orders: '0',
      revenue: '0'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get('/users/dashboard');
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalSales: data.totalSales || 0,
          recentOrders: data.recentOrders || [],
          lowStockProducts: data.lowStockProducts || [],
          monthlyData: data.monthlyData || [],
          categoryDistribution: data.categoryDistribution || [],
          growth: data.growth || { users: '0', orders: '0', revenue: '0' }
        });
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats.monthlyData.map(m => m.label),
    datasets: [
      {
        label: "Users",
        backgroundColor: "#A58077",
        data: stats.monthlyData.map(m => m.users),
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Orders",
        backgroundColor: "#E5CBBE",
        data: stats.monthlyData.map(m => m.orders),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const revenueData = {
    labels: stats.monthlyData.map(m => m.label),
    datasets: [
      {
        label: "Revenue",
        data: stats.monthlyData.map(m => m.revenue),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#4CAF50",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const categoryData = {
    labels: stats.categoryDistribution.map(c => c._id || 'Unknown'),
    datasets: [
      {
        data: stats.categoryDistribution.map(c => c.count),
        backgroundColor: [
          "#A58077",
          "#E5CBBE",
          "#8B6B63",
          "#4CAF50",
          "#FF9800",
          "#2196F3",
          "#9C27B0"
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#E5CBBE',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#A58077'
        },
        grid: {
          color: '#3C3C3C'
        }
      },
      y: {
        ticks: {
          color: '#A58077'
        },
        grid: {
          color: '#3C3C3C'
        }
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, iconColor, growth, onClick }) => {
    const isPositive = parseFloat(growth) >= 0;
    
    return (
      <div 
        className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-[#A58077] font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {growth !== undefined && (
              <div className="flex items-center space-x-1 mt-2">
                {isPositive ? (
                  <FaArrowUp className="text-green-400 text-xs" />
                ) : (
                  <FaArrowDown className="text-red-400 text-xs" />
                )}
                <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(parseFloat(growth))}%
                </span>
                <span className="text-xs text-[#A58077]">from last month</span>
              </div>
            )}
          </div>
          <div className={`bg-gradient-to-br ${iconColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="text-white text-2xl" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E5CBBE] mb-2">Dashboard Overview</h1>
          <p className="text-[#A58077] text-lg">Monitor your business performance</p>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-400 text-6xl mx-auto mb-4" />
            <p className="text-red-400 mb-4 text-lg">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-[#A58077] text-white px-6 py-3 rounded-xl hover:bg-[#8B6B63] transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-xl flex items-center justify-center">
            <FaChartLine className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#E5CBBE]">Dashboard Overview</h1>
            <p className="text-[#A58077] text-lg">Monitor your business performance</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          iconColor="from-blue-500 to-blue-600"
          growth={stats.growth.users}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={FaBoxes}
          iconColor="from-green-500 to-green-600"
          growth="8"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FaShoppingCart}
          iconColor="from-purple-500 to-purple-600"
          growth={stats.growth.orders}
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalSales)}
          icon={FaDollarSign}
          iconColor="from-yellow-500 to-yellow-600"
          growth={stats.growth.revenue}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Users & Orders Chart */}
        <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
              <FaArrowUp className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E5CBBE]">Users & Orders</h3>
              <p className="text-[#A58077] text-sm">Monthly growth comparison</p>
            </div>
          </div>
          <div className="h-64">
            {stats.monthlyData.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="h-64 flex items-center justify-center text-[#A58077]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E5CBBE]">Revenue Trend</h3>
              <p className="text-[#A58077] text-sm">Monthly revenue performance</p>
            </div>
          </div>
          <div className="h-64">
            {stats.monthlyData.length > 0 ? (
              <Line data={revenueData} options={chartOptions} />
            ) : (
              <div className="h-64 flex items-center justify-center text-[#A58077]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Distribution */}
        <div className="lg:col-span-1">
          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaGift className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#E5CBBE]">Categories</h3>
                <p className="text-[#A58077] text-sm">Product distribution</p>
              </div>
            </div>
            <div className="h-64">
              {stats.categoryDistribution.length > 0 ? (
                <Doughnut data={categoryData} options={chartOptions} />
              ) : (
                <div className="h-64 flex items-center justify-center text-[#A58077]">
                  No categories available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaShoppingCart className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#E5CBBE]">Recent Orders</h3>
                  <p className="text-[#A58077] text-sm">Latest customer orders</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          #{order._id?.slice(-4) || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#E5CBBE]">
                          {order.userId?.name || order.userId?.email || 'Guest'}
                        </p>
                        <p className="text-sm text-[#A58077]">
                          {order.products?.length || 0} items • {formatCurrency(order.total || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                      <button className="p-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#A58077]">
                  No recent orders
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="mt-8 bg-[#2C2C2C] rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E5CBBE]">Low Stock Alert</h3>
              <p className="text-[#A58077] text-sm">{stats.lowStockProducts.length} products need restocking</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockProducts.map((product, index) => (
              <div 
                key={product._id || index} 
                className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/admin/products')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                    <FaBoxes className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#E5CBBE] text-sm truncate">
                      {product.name || `Product ${index + 1}`}
                    </p>
                    <p className="text-xs text-[#A58077]">
                      Stock: {product.stock || 0}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
                  <FaEdit />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
