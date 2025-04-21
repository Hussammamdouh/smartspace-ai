import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import ErrorBoundary from "./components/ErrorBoundry";
import ProductsPage from "./pages/Products";
import SingleProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import PaymentPage from "./pages/Checkout";
import Profile from "./pages/Profile";
import GeminiImageGenerator from "./pages/GeminiChat";
import UnifiedChat from "./pages/Chatpage";

// Lazy load heavy components
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} limit={3} />
        <Navbar />
        <Suspense fallback={<div className="text-center p-5">Loading...</div>}>
          <Routes>
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/Products" element={<ProductsPage/>} />
            <Route path="/Product/:id" element={<SingleProductPage/>} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/chatbot" element={<GeminiImageGenerator/>} />
            <Route path="/checkout" element={<PaymentPage/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/ai" element={<UnifiedChat/>}/>
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
