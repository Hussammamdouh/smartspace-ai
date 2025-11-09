import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { 
  FaSearch, 
  FaFilter, 
  FaUser, 
  FaBan, 
  FaCheck,
  FaTrash,
  FaDownload,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { SearchBar, FilterDropdown } from "../components/Filters";
import { TableSkeleton } from "../components/SkeletonLoader";
import { formatDate, formatDateTime, exportToCSV, getStatusColor } from "../utils/helpers";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);

      const response = await axiosInstance.get(`/users?${params.toString()}`);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.meta?.totalPages || 1);
        setTotalItems(response.data.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await axiosInstance.delete(`/users/${userToDelete._id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete user";
      toast.error(errorMsg);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleBlock = async (user) => {
    try {
      await axiosInstance.patch(`/users/${user._id}`, {
        isBlocked: !user.isBlocked
      });
      toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully!`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user status:", err);
      toast.error("Failed to update user status");
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await axiosInstance.patch(`/users/${user._id}`, {
        role: newRole
      });
      toast.success(`User role updated to ${newRole}!`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user role:", err);
      const errorMsg = err.response?.data?.message || "Failed to update user role";
      toast.error(errorMsg);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/users/${userId}`);
      if (data.success) {
        setSelectedUser(data.data);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      toast.error("Failed to load user details");
    }
  };

  const handleExport = () => {
    const exportData = users.map(user => ({
      'Name': user.name || 'N/A',
      'Email': user.email || 'N/A',
      'Phone': user.phone || 'N/A',
      'Role': user.role || 'user',
      'Status': user.isBlocked ? 'Blocked' : 'Active',
      'Joined Date': formatDate(user.createdAt),
      'Country': user.country || 'N/A',
    }));
    
    exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Users exported successfully');
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRole("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Users Management</h1>
          <p className="text-[#A58077] text-lg">Manage user accounts and permissions</p>
        </div>
        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Users Management</h1>
          <p className="text-[#A58077] text-lg">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg hover:bg-[#A58077] hover:text-white transition"
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
          {(searchQuery || filterRole || filterStatus) && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#A58077] hover:text-[#E5CBBE] flex items-center gap-1"
            >
              <FaTimes />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
            onClear={() => setSearchQuery("")}
          />
          <FilterDropdown
            value={filterRole}
            onChange={setFilterRole}
            options={roleOptions}
            placeholder="All Roles"
          />
          <FilterDropdown
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#2C2C2C] rounded-xl shadow-lg border border-[#3C3C3C] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={7} />
            </div>
          ) : (
            <>
              <table className="w-full table-auto text-left">
                <thead className="bg-[#A58077] text-white">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold">User</th>
                    <th className="py-3 px-4 text-sm font-semibold">Email</th>
                    <th className="py-3 px-4 text-sm font-semibold">Role</th>
                    <th className="py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold">Joined</th>
                    <th className="py-3 px-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr 
                      key={user._id} 
                      className="border-b border-[#3C3C3C] hover:bg-[#1e1e1e] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#A58077] rounded-full flex items-center justify-center">
                            <FaUser size={16} />
                          </div>
                          <div>
                            <p className="font-medium">{user.name || 'N/A'}</p>
                            {user.nickName && (
                              <p className="text-sm text-[#A58077]">{user.nickName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="bg-[#1e1e1e] text-[#E5CBBE] px-2 py-1 rounded border border-[#3C3C3C] text-sm hover:border-[#A58077] transition-colors cursor-pointer"
                          disabled={user._id === localStorage.getItem('userId')} // Prevent changing own role
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isBlocked ? 'blocked' : 'active')}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="p-2 bg-[#1e1e1e] text-[#A58077] rounded-lg hover:bg-[#A58077] hover:text-white transition"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`p-2 rounded-lg transition ${
                              user.isBlocked 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                            }`}
                            title={user.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {user.isBlocked ? <FaCheck size={14} /> : <FaBan size={14} />}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"
                            title="Delete"
                            disabled={user.role === 'admin'}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-xl text-[#A58077]">
                    {searchQuery || filterRole || filterStatus 
                      ? 'No users found matching your criteria' 
                      : 'No users found'}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-[#3C3C3C] text-[#E5CBBE] rounded-lg hover:bg-[#4C4C4C] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#A58077]">
          Are you sure you want to delete user &quot;{userToDelete?.name || userToDelete?.email}&quot;? This action cannot be undone.
        </p>
        {userToDelete?.role === 'admin' && (
          <p className="text-red-400 text-sm mt-2">Warning: This user is an admin.</p>
        )}
      </Modal>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#A58077] mb-1">Name</p>
                <p className="font-medium">{selectedUser.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Email</p>
                <p>{selectedUser.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Phone</p>
                <p>{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Role</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedUser.role || 'user'}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.isBlocked ? 'blocked' : 'active')}`}>
                  {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-[#A58077] mb-1">Joined Date</p>
                <p>{formatDateTime(selectedUser.createdAt)}</p>
              </div>
              {selectedUser.country && (
                <div>
                  <p className="text-sm text-[#A58077] mb-1">Country</p>
                  <p>{selectedUser.country}</p>
                </div>
              )}
              {selectedUser.gender && (
                <div>
                  <p className="text-sm text-[#A58077] mb-1">Gender</p>
                  <p className="capitalize">{selectedUser.gender}</p>
                </div>
              )}
            </div>
            
            {selectedUser.address && (
              <div className="border-t border-[#3C3C3C] pt-4">
                <p className="text-sm text-[#A58077] mb-1">Address</p>
                <p>{selectedUser.address}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersManagement;
