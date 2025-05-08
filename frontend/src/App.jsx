import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import ProtectAdminRoute from "./services/ProtectAdminRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundry";
import NotFoundPage from "./pages/error";
import ThankYouPage from "./pages/ThankYou";

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

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          limit={3}
          theme="dark"
        />
        <Navbar />

        <Suspense
          fallback={
            <div className="text-center p-5 text-[#A58077] animate-pulse">
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

            {/* Core Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<SingleProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chatbot" element={<UnifiedChat />} />
            <Route path="/ai" element={<UnifiedChat />} />

            {/* Payment and Orders */}
            <Route path="/checkout" element={<PaymentPage />} />
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
      </Router>
    </ErrorBoundary>
  );
};

export default App;
