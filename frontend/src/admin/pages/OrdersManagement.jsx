// admin/pages/OrdersManagement.jsx

import { useEffect, useState } from "react";
import axios from "axios";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`);
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${id}`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead className="bg-[#A58077] text-white">
              <tr>
                <th className="py-2 px-4">Order ID</th>
                <th className="py-2 px-4">User</th>
                <th className="py-2 px-4">Items</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Payment</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-700">
                  <td className="py-2 px-4">{order._id.slice(0, 8)}...</td>
                  <td className="py-2 px-4">{order.user?.name || "Guest"}</td>
                  <td className="py-2 px-4">{order.items.length} Items</td>
                  <td className="py-2 px-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-2 px-4 capitalize">{order.paymentMethod}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    {order.status !== "completed" && (
                      <button
                        onClick={() => updateOrderStatus(order._id, "completed")}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
