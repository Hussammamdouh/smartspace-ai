import { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon, FiChevronDown } from "react-icons/fi";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import Avatar from "./Avatar";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const navLinkClass = "text-lg font-medium hover:text-[#A58077] transition";

  return (
    <nav className="sticky top-0 z-50 bg-[#181818] dark:bg-[#E5CBBE] text-[#E5CBBE] dark:text-[#181818] shadow-sm backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold hover:text-[#A58077] transition"
        >
          AI Interior Design
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className={navLinkClass}>
            Home
          </Link>
          <Link to="/products" className={navLinkClass}>
            Products
          </Link>
          <Link to="/cart" className={`${navLinkClass} relative`}>
            Cart
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          <Link to="/chatbot" className={navLinkClass}>
            AI Chat
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className={navLinkClass}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 relative">
          <button
            onClick={toggleTheme}
            className="text-xl hover:text-[#A58077] transition"
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:text-[#A58077] transition"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <Avatar name={user.name} size={36} />
                <FiChevronDown
                  className={`transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-[#181818] rounded-xl shadow-xl py-2 transition-all origin-top-right scale-100 animate-fade-in z-50">
                  <div className="px-4 py-2">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <hr className="my-1 border-gray-200" />
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm border border-[#E5CBBE] dark:border-[#181818] rounded-[12px] hover:text-[#A58077] hover:border-[#A58077] hover:bg-[#E5CBBE] dark:hover:bg-[#181818] transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-xl hover:text-[#A58077] transition"
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-2xl"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-6 pt-2 space-y-4 bg-[#181818] dark:bg-[#E5CBBE] text-[#E5CBBE] dark:text-[#181818] border-t border-[#A09C9C] transition-all animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            Products
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileOpen(false)}
            className={`${navLinkClass} relative`}
          >
            Cart
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          <Link
            to="/chatbot"
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            AI Chat
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={navLinkClass}
            >
              Dashboard
            </Link>
          )}

          <hr className="border-[#A09C9C]" />

          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size={36} />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-sm border border-[#E5CBBE] px-4 py-2 rounded hover:text-[#A58077] hover:border-[#A58077] hover:bg-[#E5CBBE] transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-sm border border-[#E5CBBE] px-4 py-2 rounded hover:text-[#A58077] hover:border-[#A58077] hover:bg-[#E5CBBE] transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;