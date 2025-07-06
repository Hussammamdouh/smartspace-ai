import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Loader from '../components/Loader';


const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    console.log('EmailVerification component mounted with token:', token);
    if (token) {
      verifyEmail(token);
    } else {
      console.log('No token provided');
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      console.log('Attempting to verify email with token:', verificationToken);
      setStatus('verifying');
      setMessage('');

      const response = await axiosInstance.get(`/auth/verify-email/${verificationToken}`);
      
      setStatus('success');
      setMessage(response.data.message || 'Your email has been successfully verified. You can now log in to your account.');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: '',
            type: 'success'
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.status === 400) {
        if (error.response.data.message?.includes('expired')) {
          setStatus('expired');
          setMessage('Verification token has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(error.response.data.message || 'Invalid verification token.');
        }
      } else {
        setStatus('error');
        setMessage('Email verification failed.');
      }
    }
  };

  const resendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }

    try {
      setIsResending(true);
      setMessage('Sending verification email...');

      await axiosInstance.post('/auth/resend-verification', { email });
      
      setStatus('success');
      setMessage('Verification email sent successfully!');
      
      // Clear email field
      setEmail('');
      
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage(error.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {'Email Verified!'}
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="text-sm text-gray-500">
              {'Redirecting to login page'}...
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {''}
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <form onSubmit={resendVerification} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {'Email Address'}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={'Enter your email address'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isResending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    {'Sending'}...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            </form>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {'Email verification failed.'}
            </h3>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {'Go to Login'}
              </Link>
              
              <div className="text-sm text-gray-500">
                {'Need help'}?{' '}
                <Link to="/contact" className="text-blue-600 hover:text-blue-500">
                  {'Contact Support'}
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {'Email Verification'}
          </h2>
          <p className="text-sm text-gray-600">
            {'Verifying your email address...'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {'Back to Home'}
        </Link>
      </div>
    </div>
  );
};

export default EmailVerification; 