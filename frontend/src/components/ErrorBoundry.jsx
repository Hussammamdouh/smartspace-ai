import React from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to your error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Show error toast
    toast.error("Something went wrong. Please try again.");
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#181818] text-[#E5CBBE] p-4">
          <div className="max-w-lg w-full bg-[#2C2C2C] rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 mb-6">
              We apologize for the inconvenience. Our team has been notified of this issue.
            </p>
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
            {import.meta.env.DEV && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg text-left overflow-auto">
                <p className="text-red-400 mb-2">Error Details:</p>
                <pre className="text-sm text-gray-300">
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
