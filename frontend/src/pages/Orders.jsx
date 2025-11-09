import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16 flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-[#A58077] mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E5CBBE]">Orders</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-bold mb-2">
            My
            <span className="bg-gradient-to-r from-[#A58077] to-[#8B6B63] bg-clip-text text-transparent"> Orders</span>
          </h1>
          <p className="text-[#A58077] text-lg">
            View and manage your order history
          </p>
        </div>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-16">
            <FaBox className="text-8xl text-[#A58077] mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
            <p className="text-[#A58077] mb-8">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div
                key={order._id}
                className="bg-[#2C2C2C] rounded-xl p-6 border border-[#3C3C3C] hover:border-[#A58077]/50 transition-all duration-300"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="text-sm text-[#A58077]">Order #{order._id.slice(-8).toUpperCase()}</div>
                        <div className="text-xs text-[#A58077]">
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
                        <span className="text-sm text-[#A58077]">Tracking:</span>
                        <code className="bg-[#1e1e1e] px-2 py-1 rounded text-sm font-mono">
                          {order.trackingNumber}
                        </code>
                        <button
                          onClick={() => copyTrackingNumber(order.trackingNumber)}
                          className="text-[#A58077] hover:text-[#E5CBBE] transition-colors"
                          title="Copy tracking number"
                        >
                          <FaCopy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col md:items-end space-y-2">
                    <div className="text-2xl font-bold text-[#A58077]">
                      ${order.total?.toFixed(2) ?? 'N/A'}
                    </div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder === order._id ? (
                  <div className="mt-6 space-y-4">
                    {/* Products */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Items</h3>
                      <div className="space-y-3">
                        {order.products && Array.isArray(order.products) && order.products.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.name || 'Product'}</div>
                              <div className="text-sm text-[#A58077]">
                                Quantity: {item.quantity} × ${item.price?.toFixed(2) ?? 'N/A'}
                              </div>
                            </div>
                            <div className="text-right font-semibold">
                              ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {(order.subtotal || order.shippingCost !== undefined || order.discount) && (
                      <div className="border-t border-[#3C3C3C] pt-4 space-y-2">
                        {order.subtotal !== undefined && (
                          <div className="flex justify-between text-sm">
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
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>{order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-[#3C3C3C] pt-2">
                          <span>Total:</span>
                          <span className="text-[#A58077]">${order.total?.toFixed(2) ?? 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="border-t border-[#3C3C3C] pt-4">
                        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-[#A58077]">
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
                    <div className="border-t border-[#3C3C3C] pt-4">
                      <div className="text-sm">
                        <span className="text-[#A58077]">Payment Method: </span>
                        <span className="capitalize">
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
                      className="w-full md:w-auto px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-colors"
                    >
                      Hide Details
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#A58077]">
                      {order.products?.length || 0} item{(order.products?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order._id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#1e1e1e] text-[#E5CBBE] rounded-lg hover:bg-[#A58077] hover:text-white transition-colors"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrderId === order._id}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTrash />
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
