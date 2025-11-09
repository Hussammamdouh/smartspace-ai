import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';
import { 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaEye,
  FaTrash,
  FaCopy
} from 'react-icons/fa';

const Orders = () => {
  const { isDarkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get('/orders');
      setOrders(data.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const response = await axiosInstance.delete(`/orders/${orderId}`);
      if (response.data.status === 'success') {
        toast.success('Order cancelled successfully');
        fetchOrders(); // Reload orders
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const copyTrackingNumber = (trackingNumber) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success('Tracking number copied to clipboard!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaBox className="text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-purple-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const canCancelOrder = (status) => {
    return ['pending', 'processing'].includes(status);
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-24 pb-16 flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        <Loader size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen pt-24 pb-16 flex items-center justify-center transition-colors duration-500 ${
        isDarkMode ? 'bg-[#181818] text-[#E5CBBE]' : 'bg-gradient-to-b from-[#F5F1ED] via-[#FAF7F3] to-[#F0EBE6] text-[#2C2C2C]'
      }`}>
        <div className="text-center">
          <div className={`text-xl mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>{error}</div>
          <button
            onClick={fetchOrders}
            className={`px-6 py-3 text-white rounded-lg transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-32 transition-colors duration-500 relative overflow-hidden ${
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <nav className={`flex items-center space-x-2 text-sm mb-6 transition-colors duration-500 ${
            isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
          }`}>
            <span className="hover:underline cursor-pointer">Home</span>
            <span className="opacity-50">/</span>
            <span className={`font-medium ${isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'}`}>Orders</span>
          </nav>
          
          <div className="inline-block mb-4">
            <span className={`text-sm font-semibold uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#A58077]/20 to-[#8B6B63]/20 border-[#A58077]/30 text-[#E5CBBE]'
                : 'bg-gradient-to-r from-[#8B6B61]/20 to-[#A58077]/20 border-[#8B6B61]/30 text-[#2C2C2C]'
            }`}>
              Order History
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
            }`}> Orders</span>
          </h1>
          <p className={`text-xl sm:text-2xl max-w-2xl transition-colors duration-500 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            View and manage your order history
          </p>
        </div>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-300 ${
              isDarkMode ? 'bg-[#A58077]/20' : 'bg-[#8B6B61]/20'
            }`}>
              <FaBox className={`text-6xl ${isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
            }`}>No Orders Yet</h2>
            <p className={`mb-8 transition-colors duration-300 ${
              isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
            }`}>You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] hover:from-[#8B6B63] hover:to-[#A58077]'
                  : 'bg-gradient-to-r from-[#8B6B61] to-[#A58077] hover:from-[#A58077] hover:to-[#8B6B61]'
              }`}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div
                key={order._id}
                className={`rounded-xl p-6 border backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.02] perspective-1000 ${
                  isDarkMode
                    ? 'bg-[#2C2C2C]/80 border-[#3C3C3C] hover:border-[#A58077]/50'
                    : 'bg-white/80 border-[#E5D3C7] hover:border-[#8B6B61]/50 shadow-lg'
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>Order #{order._id.slice(-8).toUpperCase()}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>Tracking:</span>
                        <code className={`px-2 py-1 rounded text-sm font-mono transition-colors duration-300 ${
                          isDarkMode ? 'bg-[#1e1e1e] text-[#E5CBBE]' : 'bg-white border border-[#E5D3C7] text-[#2C2C2C] shadow-md'
                        }`}>
                          {order.trackingNumber}
                        </code>
                        <button
                          onClick={() => copyTrackingNumber(order.trackingNumber)}
                          className={`transition-all duration-200 hover:scale-110 hover:rotate-12 ${
                            isDarkMode ? 'text-[#A58077] hover:text-[#E5CBBE]' : 'text-[#8B6B61] hover:text-[#2C2C2C]'
                          }`}
                          title="Copy tracking number"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col md:items-end space-y-2">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>
                      ${order.total?.toFixed(2) ?? 'N/A'}
                    </div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-semibold transform hover:scale-105 transition-all duration-300 ${getStatusColor(order.status)}`}>
                      <div className="transform hover:rotate-12 transition-transform duration-300">
                        {getStatusIcon(order.status)}
                      </div>
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder === order._id ? (
                  <div className="mt-6 space-y-4">
                    {/* Products */}
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                      }`}>Items</h3>
                      <div className="space-y-3">
                        {order.products && Array.isArray(order.products) && order.products.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                              isDarkMode
                                ? 'bg-[#1e1e1e]'
                                : 'bg-white border border-[#E5D3C7] shadow-md'
                            }`}
                          >
                            <div className="flex-1">
                              <div className={`font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                              }`}>{item.name || 'Product'}</div>
                              <div className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                              }`}>
                                Quantity: {item.quantity} × ${item.price?.toFixed(2) ?? 'N/A'}
                              </div>
                            </div>
                            <div className={`text-right font-semibold transition-colors duration-300 ${
                              isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                            }`}>
                              ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {(order.subtotal || order.shippingCost !== undefined || order.discount) && (
                      <div className={`border-t pt-4 space-y-2 transition-colors duration-300 ${
                        isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
                      }`}>
                        {order.subtotal !== undefined && (
                          <div className={`flex justify-between text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                          }`}>
                            <span>Subtotal:</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-400">
                            <span>Discount:</span>
                            <span>-${order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        {order.shippingCost !== undefined && (
                          <div className={`flex justify-between text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                          }`}>
                            <span>Shipping:</span>
                            <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</span>
                          </div>
                        )}
                        <div className={`flex justify-between text-lg font-bold border-t pt-2 transition-colors duration-300 ${
                          isDarkMode ? 'border-[#3C3C3C] text-[#E5CBBE]' : 'border-[#E5D3C7] text-[#2C2C2C]'
                        }`}>
                          <span>Total:</span>
                          <span className={isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'}>${order.total?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className={`border-t pt-4 transition-colors duration-300 ${
                        isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
                      }`}>
                        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                        }`}>Shipping Address</h3>
                        <div className={`text-sm transition-colors duration-300 ${
                          isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                        }`}>
                          <p>{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className={`border-t pt-4 transition-colors duration-300 ${
                      isDarkMode ? 'border-[#3C3C3C]' : 'border-[#E5D3C7]'
                    }`}>
                      <div className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                      }`}>
                        <span>Payment Method: </span>
                        <span className={`capitalize transition-colors duration-300 ${
                          isDarkMode ? 'text-[#E5CBBE]' : 'text-[#2C2C2C]'
                        }`}>
                          {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                        </span>
                      </div>
                      {order.isPaid && (
                        <div className="text-sm text-green-400 mt-1">
                          ✓ Payment Received
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className={`w-full md:w-auto px-4 py-2 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                        isDarkMode
                          ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                          : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                      }`}
                    >
                      Hide Details
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-[#A58077]' : 'text-[#8B6B61]'
                    }`}>
                      {order.products?.length || 0} item{(order.products?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order._id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border transform hover:scale-105 ${
                          isDarkMode
                            ? 'bg-[#1e1e1e] text-[#E5CBBE] border-[#3C3C3C] hover:bg-gradient-to-r hover:from-[#A58077] hover:to-[#8B6B63] hover:text-white hover:border-[#A58077]'
                            : 'bg-white text-[#2C2C2C] border-[#E5D3C7] hover:bg-gradient-to-r hover:from-[#8B6B61] hover:to-[#A58077] hover:text-white hover:border-[#8B6B61] shadow-md'
                        }`}
                      >
                        <FaEye className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>View Details</span>
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          <FaTrash className="group-hover:rotate-12 transition-transform duration-300" />
                          <span>{cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
