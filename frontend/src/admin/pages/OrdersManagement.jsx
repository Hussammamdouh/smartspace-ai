import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { 
  FaSearch, 
  FaFilter,
  FaEye,
  FaDownload,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { SearchBar, FilterDropdown, DateRangeFilter } from "../components/Filters";
import { TableSkeleton } from "../components/SkeletonLoader";
import { formatDate, formatDateTime, formatCurrency, formatOrderStatus, getStatusColor, exportToCSV } from "../utils/helpers";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentFilter, startDate, endDate, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('paymentMethod', paymentFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);

      const { data } = await axiosInstance.get(`/orders/admin/all?${params.toString()}`);
      
      if (data.status === 'success') {
        setOrders(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalItems(data.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error('Failed to update order status');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const { data } = await axiosInstance.get(`/orders/${orderId}`);
      if (data.status === 'success') {
        setSelectedOrder(data.data);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      toast.error("Failed to load order details");
    }
  };

  const handleExport = () => {
    const exportData = orders.map(order => ({
      'Order ID': order._id,
      'Customer': order.userId?.name || order.userId?.email || 'Guest',
      'Email': order.userId?.email || 'N/A',
      'Items': order.products?.length || 0,
      'Total': order.total || 0,
      'Payment Method': order.paymentMethod || 'N/A',
      'Status': order.status || 'pending',
      'Date': formatDateTime(order.createdAt),
    }));
    
    exportToCSV(exportData, `orders-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Orders exported successfully');
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPaymentFilter("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'card', label: 'Card' },
    { value: 'cash-on-delivery', label: 'Cash on Delivery' },
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#E5CBBE] mb-2">Orders Management</h1>
          <p className="text-[#A58077] text-lg">Manage and track all customer orders</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-200"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#E5CBBE] flex items-center gap-2">
            <FaFilter />
            Filters
          </h3>
          {(searchQuery || statusFilter || paymentFilter || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#A58077] hover:text-[#E5CBBE] flex items-center gap-1"
            >
              <FaTimes />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Order ID..."
            onClear={() => setSearchQuery("")}
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Filter by Status"
          />
          <FilterDropdown
            value={paymentFilter}
            onChange={setPaymentFilter}
            options={paymentOptions}
            placeholder="Filter by Payment"
          />
        </div>
        
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#2C2C2C] rounded-xl shadow-lg border border-[#3C3C3C] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : (
            <>
              <table className="w-full table-auto text-left">
                <thead className="bg-[#A58077] text-white">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold">Order ID</th>
                    <th className="py-3 px-4 text-sm font-semibold">Customer</th>
                    <th className="py-3 px-4 text-sm font-semibold">Items</th>
                    <th className="py-3 px-4 text-sm font-semibold">Total</th>
                    <th className="py-3 px-4 text-sm font-semibold">Payment</th>
                    <th className="py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold">Date</th>
                    <th className="py-3 px-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="border-b border-[#3C3C3C] hover:bg-[#1e1e1e] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm">#{order._id.slice(-8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{order.userId?.name || 'Guest'}</p>
                          <p className="text-sm text-[#A58077]">{order.userId?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{order.products?.length || 0} items</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(order.total || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-sm">{order.paymentMethod || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)} bg-opacity-20 cursor-pointer`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="p-2 bg-[#1e1e1e] text-[#A58077] rounded-lg hover:bg-[#A58077] hover:text-white transition-all duration-200"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-xl text-[#A58077]">
                    {searchQuery || statusFilter || paymentFilter || startDate || endDate
                      ? 'No orders found matching your criteria'
                      : 'No orders found'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#A58077] mb-1">Order ID</p>
                <p className="font-mono text-sm">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {formatOrderStatus(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Payment Method</p>
                <p className="capitalize">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Order Date</p>
                <p>{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t border-[#3C3C3C] pt-4">
              <h4 className="font-semibold mb-3">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#A58077] mb-1">Name</p>
                  <p>{selectedOrder.userId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#A58077] mb-1">Email</p>
                  <p>{selectedOrder.userId?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div className="border-t border-[#3C3C3C] pt-4">
                <h4 className="font-semibold mb-3">Shipping Address</h4>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p className="mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Products */}
            <div className="border-t border-[#3C3C3C] pt-4">
              <h4 className="font-semibold mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.products?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1e1e1e] rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name || item.productId?.name || 'Product'}</p>
                      <p className="text-sm text-[#A58077]">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-[#3C3C3C] pt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-[#A58077]">
                {formatCurrency(selectedOrder.total || 0)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;
