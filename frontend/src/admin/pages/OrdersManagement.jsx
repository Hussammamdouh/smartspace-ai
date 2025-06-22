// admin/pages/OrdersManagement.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/orders');
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${id}`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A58077]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead className="bg-[#A58077] text-white">
            <tr>
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Items</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Payment</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-700">
                <td className="py-2 px-4">{order._id.slice(0, 8)}...</td>
                <td className="py-2 px-4">{order.userId?.name || "Guest"}</td>
                <td className="py-2 px-4">{order.products.length} Items</td>
                <td className="py-2 px-4">${order.total.toFixed(2)}</td>
                <td className="py-2 px-4 capitalize">{order.paymentMethod}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="bg-[#2C2C2C] text-[#E5CBBE] px-2 py-1 rounded border border-[#A58077]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-[#A58077]">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
