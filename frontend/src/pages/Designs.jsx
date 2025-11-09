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
  FaEye,
  FaFilter,
  FaSearch,
  FaTimes,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';
import Loader from '../components/Loader';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    style: '',
    roomType: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please log in to view your designs');
      navigate('/login');
      return;
    }
    
    fetchDesigns();
  }, [navigate, pagination.page, filters]);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });
      
      const response = await axiosInstance.get(`/design/user-designs?${params}`);
      
      if (response.data.status === 'success') {
        setDesigns(response.data.data || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination
          }));
        }
      } else {
        setError('Failed to fetch designs');
        toast.error('Failed to load designs');
      }
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError(`Failed to fetch designs: ${err.response?.data?.message || err.message}`);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      style: '',
      roomType: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="text-green-400" />;
      case 'processing':
        return <FaClock className="text-yellow-400" />;
      case 'failed':
        return <FaExclamationCircle className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  if (loading && designs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] flex items-center justify-center">
        <Loader size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] via-[#1a1a1a] to-[#1e1e1e] text-[#E5CBBE]">
      {/* Header */}
      <header className="bg-[#2C2C2C]/80 backdrop-blur-sm border-b border-[#3C3C3C] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                <p className="text-[#A58077] text-sm">
                  {pagination.total > 0 ? `${pagination.total} designs found` : 'View and edit your generated designs'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                  showFilters || hasActiveFilters
                    ? 'bg-[#A58077] text-white'
                    : 'bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] hover:border-[#A58077]'
                }`}
              >
                <FaFilter />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-[#A58077] rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {Object.values(filters).filter(v => v !== '').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/generate-image')}
                className="px-6 py-3 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium flex items-center gap-2"
              >
                <FaPalette />
                Generate New Design
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-[#1e1e1e] rounded-lg border border-[#3C3C3C]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search designs..."
                      className="w-full pl-10 pr-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Style Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    Style
                  </label>
                  <select
                    value={filters.style}
                    onChange={(e) => handleFilterChange('style', e.target.value)}
                    className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                  >
                    <option value="">All Styles</option>
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="vintage">Vintage</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                {/* Room Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    Room Type
                  </label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => handleFilterChange('roomType', e.target.value)}
                    className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                  >
                    <option value="">All Rooms</option>
                    <option value="living room">Living Room</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bathroom">Bathroom</option>
                    <option value="dining room">Dining Room</option>
                    <option value="office">Office</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#E5CBBE] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] focus:outline-none focus:border-[#A58077]"
                  />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="lg:col-span-3 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-[#3C3C3C] text-[#E5CBBE] rounded-lg hover:bg-[#4C4C4C] transition-all duration-300 flex items-center gap-2"
                    >
                      <FaTimes />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
            <h3 className="text-2xl font-bold text-[#E5CBBE] mb-4">
              {hasActiveFilters ? 'No Designs Match Your Filters' : 'No Designs Yet'}
            </h3>
            <p className="text-[#A58077] text-lg mb-8">
              {hasActiveFilters 
                ? 'Try adjusting your filters or clear them to see all designs'
                : 'Start creating beautiful interior designs with AI'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/generate-image')}
                className="px-8 py-4 bg-gradient-to-r from-[#A58077] to-[#8B6B63] text-white rounded-lg hover:from-[#8B6B63] hover:to-[#A58077] transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
              >
                <FaPalette />
                Generate Your First Design
              </button>
            )}
          </div>
        ) : (
          <>
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
                    
                    {/* Status Badge */}
                    {design.status && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs">
                        {getStatusIcon(design.status)}
                        <span className="text-white capitalize">{design.status}</span>
                      </div>
                    )}

                    {/* Version Badge */}
                    {design.currentVersion > 1 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 bg-[#A58077]/90 backdrop-blur-sm rounded-full text-xs text-white">
                        <FaHistory />
                        <span>v{design.currentVersion}</span>
                      </div>
                    )}
                    
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
                      {design.metadata?.cached && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          Cached
                        </span>
                      )}
                    </div>

                    {/* Design Meta */}
                    <div className="flex items-center justify-between text-xs text-[#A58077]">
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>{formatDate(design.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaEye />
                        <span>{design.views || 0} views</span>
                      </div>
                    </div>

                    {/* API Cost Info */}
                    {design.apiCost && (
                      <div className="mt-2 text-xs text-[#A58077]">
                        Cost: ${design.apiCost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] hover:border-[#A58077] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-[#E5CBBE]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-[#2C2C2C] border border-[#3C3C3C] rounded-lg text-[#E5CBBE] hover:border-[#A58077] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Designs;
