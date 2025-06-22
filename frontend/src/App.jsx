import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundry";
import NotFoundPage from "./pages/error";
import ThankYouPage from "./pages/ThankYou";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import "./i18n";

// Pages
import ProductsPage from "./pages/Products";
import SingleProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import Profile from "./pages/Profile";
import UnifiedChat from "./pages/ChatPage";
import PaymentPage from "./pages/Payment";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import ProductsManagement from "./admin/pages/ProductsManagement";
import UsersManagement from "./admin/pages/UsersManagement";

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UserDashboard = lazy(() => import("./pages/Dashboard"));

// AppContent component that uses the theme
const AppContent = () => {
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text, minHeight: '100vh' }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        theme={isDarkMode ? "dark" : "light"}
      />
      <Navbar />

      <Suspense
        fallback={
          <div className="text-center p-5" style={{ color: colors.primary }}>
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLoggedIn>
                <Register />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectIfLoggedIn>
                <ForgotPassword />
              </RedirectIfLoggedIn>
            }
          />

          {/* Protected Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Core Pages */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<SingleProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/chatbot" element={<UnifiedChat />} />
          <Route path="/ai" element={<UnifiedChat />} />

          {/* Payment and Orders */}
          <Route path="/thankyou" element={<ThankYouPage />} />

          {/* Admin Pages */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="users" element={<UsersManagement />} />
            </Route>
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
      <Toaster position="top-center" />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
