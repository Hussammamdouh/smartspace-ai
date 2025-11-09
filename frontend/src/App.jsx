import { Suspense, lazy } from "react";
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
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Pages
import ProductsPage from "./pages/Products";
import SingleProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import WishlistPage from "./pages/Wishlist";
import Profile from "./pages/Profile";
import UnifiedChat from "./pages/ChatPage";
import PaymentPage from "./pages/Payment";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import ProductsManagement from "./admin/pages/ProductsManagement";
import UsersManagement from "./admin/pages/UsersManagement";
import OrdersManagement from "./admin/pages/OrdersManagement";
import About from './pages/About';
import Team from './pages/Team';
import Careers from './pages/Careers';
import Press from './pages/Press';
import ProjectManagement from './pages/ProjectManagement';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Orders from './pages/Orders';

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailVerification = lazy(() => import("./pages/EmailVerification"));
const UserDashboard = lazy(() => import("./pages/Dashboard"));
const GenerateImage = lazy(() => import("./pages/GenerateImage"));
const EditDesignPage = lazy(() => import("./pages/EditDesignPage"));
const Designs = lazy(() => import("./pages/Designs"));
const ThankYouPage = lazy(() => import("./pages/thankyou"));

// AppContent component that uses the theme
const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-theme-background text-theme-text">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        theme={isDarkMode ? "dark" : "light"}
      />
      <Navbar />

      <Suspense
        fallback={
          <div className="text-center p-5 text-theme-text-secondary">
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<EmailVerification />} />

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
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><UnifiedChat /></ProtectedRoute>} />
          <Route path="/ai" element={<UnifiedChat />} />

          {/* AI Pages */}
          <Route
            path="/generate-image"
            element={
              <ProtectedRoute>
                <GenerateImage />
              </ProtectedRoute>
            }
          />
          {false && <Route path="/gemini-chat" element={<div /> } />} 
          <Route
            path="/edit-design"
            element={
              <ProtectedRoute>
                <EditDesignPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designs"
            element={
              <ProtectedRoute>
                <Designs />
              </ProtectedRoute>
            }
          />

          {/* Payment and Orders */}
          <Route path="/thankyou" element={<ThankYouPage />} />

          {/* Admin Pages */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
            </Route>
          </Route>

          {/* New Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

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
