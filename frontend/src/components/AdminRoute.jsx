import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Loader from "./Loader";

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181818]">
        <Loader size={60} />
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
