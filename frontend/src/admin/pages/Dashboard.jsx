// admin/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { toast } from "react-hot-toast";
import { 
  FaUsers, 
  FaBoxes, 
  FaShoppingCart, 
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaEye,
  FaEdit,
  FaGift,
} from "react-icons/fa";
import "chart.js/auto";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyData: {
      users: [],
      orders: [],
      revenue: []
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

      // Fetch all data in parallel
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/inventory'),
        axiosInstance.get('/orders')
      ]);

      const users = usersRes.data.data || [];
      const products = productsRes.data.data || [];
      const orders = ordersRes.data.orders || [];

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const recentOrders = orders.slice(0, 5);
      const lowStockProducts = products.filter(product => (product.stock || 0) < 10);

      // Generate monthly data (last 6 months)
      const monthlyData = generateMonthlyData(orders, users);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        monthlyData
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }

    const monthlyUsers = months.map(() => Math.floor(Math.random() * 20) + 5);
    const monthlyOrders = months.map(() => Math.floor(Math.random() * 15) + 3);
    const monthlyRevenue = months.map(() => Math.floor(Math.random() * 5000) + 1000);

    return {
      users: monthlyUsers,
      orders: monthlyOrders,
      revenue: monthlyRevenue
    };
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        backgroundColor: "#A58077",
        data: stats.monthlyData.users,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Orders",
        backgroundColor: "#E5CBBE",
        data: stats.monthlyData.orders,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: stats.monthlyData.revenue,
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
    labels: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          "#A58077",
          "#E5CBBE",
          "#8B6B63",
          "#4CAF50",
          "#FF9800"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#A58077] mx-auto mb-4"></div>
              <p className="text-lg text-[#A58077]">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A58077] font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <FaArrowUp className="text-green-400 text-xs" />
                  <span className="text-xs text-green-400">+12%</span>
                  <span className="text-xs text-[#A58077]">from last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A58077] font-medium mb-1">Total Products</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalProducts.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <FaArrowUp className="text-green-400 text-xs" />
                  <span className="text-xs text-green-400">+8%</span>
                  <span className="text-xs text-[#A58077]">from last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaBoxes className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A58077] font-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  {stats.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <FaArrowUp className="text-green-400 text-xs" />
                  <span className="text-xs text-green-400">+15%</span>
                  <span className="text-xs text-[#A58077]">from last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaShoppingCart className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A58077] font-medium mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-[#E5CBBE] group-hover:text-white transition-colors duration-300">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <FaArrowUp className="text-green-400 text-xs" />
                  <span className="text-xs text-green-400">+22%</span>
                  <span className="text-xs text-[#A58077]">from last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FaDollarSign className="text-white text-2xl" />
              </div>
            </div>
          </div>
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
              <Bar data={chartData} options={chartOptions} />
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
              <Line data={revenueData} options={chartOptions} />
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
                <Doughnut data={categoryData} options={chartOptions} />
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
                <button className="text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">#{order._id?.slice(-4) || index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#E5CBBE]">
                          {order.customerName || `Customer ${index + 1}`}
                        </p>
                        <p className="text-sm text-[#A58077]">
                          {order.items?.length || 0} items • ${order.total?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                      <button className="p-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200">
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
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
              {stats.lowStockProducts.slice(0, 6).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-[#3C3C3C]">
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
    </div>
  );
};

export default Dashboard;
