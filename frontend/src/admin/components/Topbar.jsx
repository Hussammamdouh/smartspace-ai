import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaBell, 
  FaCog,
  FaChevronDown
} from "react-icons/fa";

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const notifications = [
    { id: 1, message: "New order received", time: "2 min ago", type: "order" },
    { id: 2, message: "Low stock alert: Coffee Table", time: "1 hour ago", type: "alert" },
    { id: 3, message: "New user registered", time: "3 hours ago", type: "user" }
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#181818] border-b border-[#333]">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[#E5CBBE]">Admin Dashboard</h1>
        <div className="hidden md:flex items-center gap-2 text-sm text-[#A58077]">
          <span>Welcome back,</span>
          <span className="font-semibold">{user?.name || 'Admin'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#E5CBBE] hover:text-[#A58077] transition-colors"
          >
            <FaBell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#2c2c2c] border border-[#3c3c3c] rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-[#3c3c3c]">
                <h3 className="font-semibold text-[#E5CBBE]">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-[#3c3c3c] hover:bg-[#3c3c3c] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[#E5CBBE] text-sm">{notification.message}</p>
                        <p className="text-[#A58077] text-xs mt-1">{notification.time}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ml-2 ${
                        notification.type === 'order' ? 'bg-green-400' :
                        notification.type === 'alert' ? 'bg-red-400' :
                        'bg-blue-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#3c3c3c]">
                <button className="w-full text-center text-[#A58077] text-sm hover:text-[#E5CBBE] transition-colors">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 text-[#E5CBBE] hover:text-[#A58077] transition-colors">
          <FaCog size={20} />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-[#E5CBBE] hover:text-[#A58077] transition-colors"
          >
            <div className="w-8 h-8 bg-[#A58077] rounded-full flex items-center justify-center">
              <FaUser size={16} />
            </div>
            <span className="hidden md:block font-medium">{user?.name || 'Admin'}</span>
            <FaChevronDown size={12} />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#2c2c2c] border border-[#3c3c3c] rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-[#3c3c3c]">
                <p className="font-semibold text-[#E5CBBE]">{user?.name || 'Admin'}</p>
                <p className="text-sm text-[#A58077]">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left px-3 py-2 text-[#E5CBBE] hover:bg-[#3c3c3c] rounded transition-colors flex items-center gap-2"
                >
                  <FaUser size={14} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-[#3c3c3c] rounded transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Topbar;
  