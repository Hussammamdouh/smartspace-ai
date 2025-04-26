import { Link, useLocation } from "react-router-dom";
import { FaBoxes, FaUsers, FaChartPie } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();

  const navItem = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
        location.pathname === to
          ? "bg-[#A58077] text-white"
          : "hover:bg-[#A58077] hover:text-white text-[#E5CBBE]"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#2c2c2c] p-6 min-h-screen hidden md:flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-[#E5CBBE] mb-8">Admin Panel</h2>
      {navItem("/admin", "Dashboard", FaChartPie)}
      {navItem("/admin/products", "Products", FaBoxes)}
      {navItem("/admin/users", "Users", FaUsers)}
    </aside>
  );
};

export default Sidebar;
