import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle } from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data.data);
      } catch (error) {
        toast.error('Failed to load order details');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-[#A58077]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-400" />;
      case 'processing':
        return <FaBox className="text-yellow-400" />;
      case 'shipped':
        return <FaTruck className="text-blue-400" />;
      default:
        return <FaBox className="text-[#A58077]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-[#A58077] hover:text-white transition mb-4"
          >
            <FaArrowLeft />
            Back to Profile
          </button>
          <h1 className="text-5xl font-extrabold tracking-wide">
            <span className="text-[#A58077]">O</span>rder Details
          </h1>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                {getStatusIcon(order.status)}
                <div>
                  <h2 className="text-2xl font-bold">Order Status</h2>
                  <p className={`text-lg ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-[#A58077]">Order Number</span>
                  <p className="text-lg">#{order._id.slice(-6)}</p>
                </div>
                <div>
                  <span className="text-sm text-[#A58077]">Order Date</span>
                  <p className="text-lg">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-[#A58077]">Total Amount</span>
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-4 border border-[#A58077] rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain bg-[#181818] rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-[#A58077]">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-[#A58077]">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-8">
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-[#A58077]">Name</span>
                  <p className="text-lg">{order.shippingAddress.name}</p>
                </div>
                <div>
                  <span className="text-sm text-[#A58077]">Address</span>
                  <p className="text-lg">{order.shippingAddress.address}</p>
                </div>
                <div>
                  <span className="text-sm text-[#A58077]">Phone</span>
                  <p className="text-lg">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-[#A58077]">Payment Method</span>
                  <p className="text-lg capitalize">{order.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-sm text-[#A58077]">Payment Status</span>
                  <p className={`text-lg ${order.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </p>
                </div>
                {order.paidAt && (
                  <div>
                    <span className="text-sm text-[#A58077]">Paid At</span>
                    <p className="text-lg">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails; 