import { Link, useLocation } from "react-router-dom";
import { FaBoxes, FaUsers, FaChartPie, FaShoppingCart, FaBars } from "react-icons/fa";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItem = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all ${
        location.pathname === to
          ? "bg-[#A58077] text-white"
          : "hover:bg-[#A58077] hover:text-white text-[#E5CBBE]"
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#A58077] text-white rounded-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <FaBars size={20} />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 bg-[#181818] border-r border-[#2c2c2c] p-6 min-h-screen flex flex-col space-y-6 z-40 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <h2 className="text-2xl font-bold text-[#E5CBBE] mb-8">Admin Panel</h2>
        {navItem("/admin", "Dashboard", FaChartPie)}
        {navItem("/admin/products", "Products", FaBoxes)}
        {navItem("/admin/users", "Users", FaUsers)}
        {navItem("/admin/orders", "Orders", FaShoppingCart)}
      </aside>
    </>
  );
};

export default Sidebar;
