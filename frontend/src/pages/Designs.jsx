import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaDownload, 
  FaShare, 
  FaShoppingCart,
  FaPalette,
  FaCalendar,
  FaEye
} from 'react-icons/fa';
import Loader from '../components/Loader';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found, redirecting to login');
      toast.error('Please log in to view your designs');
      navigate('/login');
      return;
    }
    
    fetchDesigns();
  }, [navigate]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      console.log('Fetching designs...');
      
      // Test the connection first
      try {
        const testResponse = await axiosInstance.get('/auth/me');
        console.log('Auth test successful:', testResponse.data);
      } catch (testError) {
        console.error('Auth test failed:', testError);
      }
      
      const response = await axiosInstance.get('/design/user-designs');
      console.log('Designs response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Setting designs:', response.data.data);
        setDesigns(response.data.data || []);
      } else {
        console.error('Failed to fetch designs - status not success');
        setError('Failed to fetch designs');
        toast.error('Failed to load designs');
      }
    } catch (err) {
      console.error('Error fetching designs:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setError(`Failed to fetch designs: ${err.response?.data?.message || err.message}`);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDesign = (design) => {
    const designData = {
      _id: design._id,
      imageUrl: design.imageUrl,
      prompt: design.preference?.additionalNotes || 'AI Generated Design',
      timestamp: design.createdAt,
      style: design.preference?.style || 'modern',
      roomType: design.preference?.roomType || 'living room'
    };
    localStorage.setItem('editDesignData', JSON.stringify(designData));
    navigate(`/edit-design?id=${design._id}`);
  };

  const handleDownload = async (imageUrl, designName) => {
    try {
      const response = await axiosInstance.post('/design/download-image', {
        imageUrl: imageUrl,
        filename: `${designName}-${Date.now()}.png`
      }, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${designName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Design downloaded successfully!');
    } catch (error) {
      console.error('Error downloading design:', error);
      toast.error('Failed to download design');
    }
  };

  const handleShare = async (imageUrl, designName) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: designName,
          text: 'Check out this AI-generated interior design!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Design URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing design:', error);
      toast.error('Failed to share design');
    }
  };

  const handlePurchaseItems = async (design) => {
    try {
      const response = await axiosInstance.post('/design/extract-items', {
        imageUrl: design.imageUrl,
        prompt: design.preference?.additionalNotes || 'AI Generated Design'
      });
      
      if (response.data.status === 'success' && response.data.data.items && response.data.data.items.length > 0) {
        // Add items to cart (you'll need to implement this based on your cart context)
        toast.success(`${response.data.data.items.length} items added to cart!`);
        navigate('/cart');
      } else {
        toast.info('No specific items found in this design');
      }
    } catch (error) {
      console.error('Error extracting items:', error);
      toast.error('Failed to extract items from design');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] flex items-center justify-center">
        <Loader size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] text-[#E5CBBE]">
      {/* Header */}
      <header className="bg-[#2C2C2C]/80 backdrop-blur-sm border-b border-[#3C3C3C]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#A58077] hover:text-[#E5CBBE] transition-colors duration-200 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-[#3C3C3C]"></div>
              
              <div>
                <h1 className="text-2xl font-bold text-[#E5CBBE]">My AI Designs</h1>
                <p className="text-[#A58077] text-sm">View and edit your generated designs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/generate-image')}
                className="px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium flex items-center gap-2"
              >
                <FaPalette />
                Generate New Design
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={fetchDesigns}
              className="px-6 py-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-[#2C2C2C] rounded-full flex items-center justify-center mx-auto mb-6">
              <FaPalette className="text-[#A58077] text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-[#E5CBBE] mb-4">No Designs Yet</h3>
            <p className="text-[#A58077] text-lg mb-8">Start creating beautiful interior designs with AI</p>
            <button
              onClick={() => navigate('/generate-image')}
              className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
            >
              <FaPalette />
              Generate Your First Design
            </button>
            
            {/* Debug info */}
            <div className="mt-8 p-4 bg-[#2C2C2C] rounded-lg max-w-md mx-auto">
              <p className="text-[#A58077] text-sm mb-2">Debug Info:</p>
              <p className="text-[#A58077] text-xs">Designs loaded: {designs.length}</p>
              <p className="text-[#A58077] text-xs">Error: {error || 'None'}</p>
              <p className="text-[#A58077] text-xs">Loading: {loading ? 'Yes' : 'No'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design._id}
                className="bg-[#2C2C2C] rounded-xl overflow-hidden border border-[#3C3C3C] hover:border-[#A58077] transition-all duration-300 group"
              >
                {/* Design Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={design.imageUrl}
                    alt={`${design.preference?.roomType || 'Room'} Design`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-design.jpg';
                    }}
                  />
                  
                  {/* Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDesign(design)}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Edit Design"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDownload(design.imageUrl, `${design.preference?.roomType || 'Design'}`)}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Download"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleShare(design.imageUrl, `${design.preference?.roomType || 'Design'}`)}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Share"
                      >
                        <FaShare className="text-sm" />
                      </button>
                      <button
                        onClick={() => handlePurchaseItems(design)}
                        className="p-3 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Purchase Items"
                      >
                        <FaShoppingCart className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Design Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#E5CBBE] group-hover:text-white transition-colors duration-200 mb-2">
                        {design.preference?.roomType || 'Room'} Design
                      </h3>
                      <p className="text-[#A58077] text-sm mb-3 line-clamp-2">
                        {design.preference?.additionalNotes || 'Beautiful AI-generated interior design'}
                      </p>
                    </div>
                  </div>

                  {/* Design Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {design.preference?.style && (
                      <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-xs font-medium">
                        {design.preference.style}
                      </span>
                    )}
                    {design.preference?.roomType && (
                      <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-xs font-medium">
                        {design.preference.roomType}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-[#A58077]/20 text-[#A58077] rounded-full text-xs font-medium">
                      AI Generated
                    </span>
                  </div>

                  {/* Design Meta */}
                  <div className="flex items-center justify-between text-xs text-[#A58077]">
                    <div className="flex items-center gap-2">
                      <FaCalendar />
                      <span>{formatDate(design.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEye />
                      <span>{design.modelUsed || 'DALL·E 3'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Designs; 