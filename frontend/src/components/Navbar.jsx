import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import ThemeSwitcher from "./ThemeSwitcher";
import Avatar from "./Avatar";
import { 
  FaShoppingCart, 
  FaHeart, 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaHome,
  FaStore,
  FaPalette,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaChevronDown
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { to: "/", label: "Home", icon: FaHome },
    { to: "/products", label: "Products", icon: FaStore },
    { to: "/generate-image", label: "AI Design", icon: FaPalette },
    { to: "/chat", label: "Chat", icon: FaComments },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-theme-background/95 backdrop-blur-xl border-b border-theme-border/30 shadow-2xl' 
          : 'bg-theme-background/90 backdrop-blur-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#A58077] to-[#8B6B63] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
                <img 
                  src="/images/Logo.JPG" 
                  alt="SmartSpace.AI Logo" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <span className="text-white font-bold text-lg lg:text-xl hidden">AI</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#E5CBBE] to-[#A58077] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#E5CBBE] transition-all duration-500">
                  SmartSpace.AI
                </h1>
                <p className="text-xs text-theme-text-secondary -mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">AI-Powered Solutions</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white shadow-lg' 
                        : 'text-theme-text hover:bg-[#A58077]/10 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <Icon className={`text-sm transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium">{link.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
              {/* Theme Switcher */}
              <div className="hidden sm:block">
                <ThemeSwitcher />
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-theme-text hover:text-white hover:bg-[#A58077]/20 rounded-xl transition-all duration-300 group hover:scale-110"
                aria-label="Cart"
              >
                <FaShoppingCart className="text-lg" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2.5 text-theme-text hover:text-white hover:bg-[#A58077]/20 rounded-xl transition-all duration-300 hover:scale-105"
                    aria-label="User menu"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="hidden sm:block font-medium max-w-24 truncate">{user.name}</span>
                    <FaChevronDown className={`text-xs transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-theme-surface/95 backdrop-blur-xl border border-theme-border/50 rounded-2xl shadow-2xl py-3 z-50 animate-in slide-in-from-top-2 duration-300">
                      <div className="px-4 py-3 border-b border-theme-border/50">
                        <p className="text-theme-text font-semibold text-lg">{user.name}</p>
                        <p className="text-theme-text-secondary text-sm opacity-80">{user.email}</p>
                      </div>
                      
                      <div className="py-2 space-y-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 text-theme-text hover:bg-[#A58077]/20 hover:text-white transition-all duration-200 rounded-lg mx-2 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaUser className="text-sm group-hover:scale-110 transition-transform duration-200" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-3 px-4 py-3 text-theme-text hover:bg-[#A58077]/20 hover:text-white transition-all duration-200 rounded-lg mx-2 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaHeart className="text-sm group-hover:scale-110 transition-transform duration-200" />
                          <span>Wishlist</span>
                        </Link>
                        
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-theme-text hover:bg-[#A58077]/20 hover:text-white transition-all duration-200 rounded-lg mx-2 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaCog className="text-sm group-hover:scale-110 transition-transform duration-200" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        <div className="border-t border-theme-border/50 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 rounded-lg mx-2 w-full group"
                          >
                            <FaSignOutAlt className="text-sm group-hover:scale-110 transition-transform duration-200" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2.5 text-theme-text hover:text-white hover:bg-[#A58077]/20 rounded-xl transition-all duration-300 font-medium hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-xl hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 text-theme-text hover:text-white hover:bg-[#A58077]/20 rounded-xl transition-all duration-300 hover:scale-110"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#2C2C2C]/95 backdrop-blur-xl border-t border-[#3C3C3C]/50 shadow-2xl animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white shadow-lg' 
                        : 'text-theme-text hover:bg-[#A58077]/20 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium text-lg">{link.label}</span>
                  </Link>
                );
              })}
              
              {user && (
                <>
                  <div className="border-t border-[#3C3C3C]/50 pt-4 mt-4">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-4 px-4 py-4 text-theme-text hover:bg-[#A58077]/20 hover:text-white rounded-xl transition-all duration-300 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="text-xl group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium text-lg">Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-4 px-4 py-4 text-theme-text hover:bg-[#A58077]/20 hover:text-white rounded-xl transition-all duration-300 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHeart className="text-xl group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium text-lg">Wishlist</span>
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-4 px-4 py-4 text-theme-text hover:bg-[#A58077]/20 hover:text-white rounded-xl transition-all duration-300 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaCog className="text-xl group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium text-lg">Admin Panel</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-4 px-4 py-4 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 w-full group"
                    >
                      <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium text-lg">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;