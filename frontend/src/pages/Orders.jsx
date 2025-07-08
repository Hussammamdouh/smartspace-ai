import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get('/orders');
        setOrders(data.data || []);
      } catch {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader size={60} />;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="flex items-center space-x-2 text-sm text-theme-text-secondary mb-4">
          <span>Home</span>
          <span>/</span>
          <span className="text-theme-text">Orders</span>
        </nav>
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-lg text-theme-text-secondary">You have no previous orders.</div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order._id} className="bg-theme-surface rounded-xl p-6 border border-theme-border shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="text-sm text-theme-primary">Order ID: {order._id}</div>
                    <div className="text-sm text-theme-primary">Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${order.total?.toFixed(2) ?? 'N/A'}</div>
                    <div className="text-sm capitalize">Status: <span className="font-semibold">{order.status}</span></div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-theme-primary">
                        <th className="px-2 py-1 text-left">Product</th>
                        <th className="px-2 py-1 text-left">Quantity</th>
                        <th className="px-2 py-1 text-left">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.products && Array.isArray(order.products) ? order.products : []).map(item => (
                        <tr key={item.productId || item.product} className="border-b border-theme-border last:border-0">
                          <td className="px-2 py-1">{item.name || item.productId || item.product}</td>
                          <td className="px-2 py-1">{item.quantity}</td>
                          <td className="px-2 py-1">${item.price?.toFixed(2) ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 