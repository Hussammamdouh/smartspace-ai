import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import { FaEdit, FaHistory } from "react-icons/fa";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get('/orders/user');
        setOrders(data.data || []);
      } catch (error) {
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
    try {
      const { data } = await axiosInstance.put('/users/profile', formData);
      updateUser(data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-[#A58077] mb-2">Home &gt; Profile</p>
          <h1 className="text-5xl font-extrabold tracking-wide">
            <span className="text-[#A58077]">P</span>rofile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#A58077] text-white rounded hover:bg-[#8B6B63] transition"
                >
                  <FaEdit />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#181818] border border-[#A58077] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#181818] border border-[#A58077] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#181818] border border-[#A58077] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 bg-[#181818] border border-[#A58077] rounded focus:outline-none focus:ring-2 focus:ring-[#A58077]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#A58077] text-white rounded hover:bg-[#8B6B63] transition"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-[#A58077]">Name</span>
                    <p className="text-lg">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#A58077]">Email</span>
                    <p className="text-lg">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#A58077]">Phone</span>
                    <p className="text-lg">{formData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[#A58077]">Address</span>
                    <p className="text-lg">{formData.address || "Not provided"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <FaHistory className="text-[#A58077]" />
                <h2 className="text-2xl font-bold">Order History</h2>
              </div>

              {orders.length === 0 ? (
                <p className="text-center text-[#A58077]">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-[#A58077] rounded-lg p-4 hover:bg-[#3C3C3C] transition cursor-pointer"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-[#A58077]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${order.total.toFixed(2)}</p>
                          <p className={`text-sm ${
                            order.status === 'delivered' ? 'text-green-400' :
                            order.status === 'processing' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full py-3 bg-[#A58077] text-white rounded hover:bg-[#8B6B63] transition"
                >
                  View Wishlist
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full py-3 bg-[#A58077] text-white rounded hover:bg-[#8B6B63] transition"
                >
                  View Cart
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-3 bg-[#A58077] text-white rounded hover:bg-[#8B6B63] transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
