import { useContext } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "../contexts/AuthContext";
import Loader from "./Loader";

const RedirectIfLoggedIn = ({ children, redirectTo = "/" }) => {
  const { user, loading } = useContext(AuthContext);

  // While auth status is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={60} />
      </div>
    );
  }

  // If logged in, redirect to the given path
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If not logged in, render the intended children
  return children;
};

RedirectIfLoggedIn.propTypes = {
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default RedirectIfLoggedIn;
