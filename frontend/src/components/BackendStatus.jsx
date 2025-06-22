import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await axiosInstance.get('/health');
        if (response.data.status === 'success') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (err) {
        console.error('Backend health check failed:', err);
        setStatus('offline');
        setError(err.message);
      }
    };

    checkBackendStatus();
  }, []);

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          <span>Checking backend...</span>
        </div>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-2">
          <FaTimesCircle />
          <span>Backend offline</span>
        </div>
        {error && (
          <div className="text-xs mt-1 opacity-75">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <FaCheckCircle />
        <span>Backend online</span>
      </div>
    </div>
  );
};

export default BackendStatus; 