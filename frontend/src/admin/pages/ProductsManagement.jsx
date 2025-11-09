import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import ProductForm from "../components/ProductForm";
import { toast } from "react-hot-toast";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDownload,
  FaCheckSquare,
  FaSquare,
  FaTimes,
} from "react-icons/fa";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import { SearchBar, FilterDropdown } from "../components/Filters";
import { TableSkeleton } from "../components/SkeletonLoader";
import { formatCurrency, exportToCSV, getStatusColor } from "../utils/helpers";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("");
  
  // Bulk actions
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, filterCategory, filterStyle, filterAvailable]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStyle) params.append('style', filterStyle);
      if (filterAvailable !== '') params.append('available', filterAvailable);

      const response = await axiosInstance.get(`/inventory?${params.toString()}`);
      
      if (response.data.status === 'success') {
        setProducts(response.data.data || []);
        setTotalPages(response.data.meta?.totalPages || 1);
        setTotalItems(response.data.meta?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    if (!product.name || !product.category || !product.price || product.stock === undefined) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("price", product.price);
      formData.append("stock", product.stock);
      
      if (product.style) formData.append("style", product.style);
      if (product.color) formData.append("color", product.color);
      if (product.description) formData.append("description", product.description);
      if (product.tags && product.tags.length > 0) {
        formData.append("tags", JSON.stringify(product.tags));
      }
      formData.append("available", product.available !== false);

      if (product.file && typeof product.file !== "string") {
        formData.append("file", product.file);
      }

      if (isEditing) {
        await axiosInstance.put(`/inventory/${product._id}`, formData);
        toast.success("Product updated successfully!");
      } else {
        await axiosInstance.post('/inventory', formData);
        toast.success("Product created successfully!");
      }

      setProduct({});
      setIsEditing(false);
      setShowForm(false);
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
      const errorMessage = err.response?.data?.message || "Failed to save product";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (item) => {
    setProduct(item);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await axiosInstance.delete(`/inventory/${productToDelete._id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error("Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedProducts).map(id =>
        axiosInstance.delete(`/inventory/${id}`)
      );
      
      await Promise.all(deletePromises);
      toast.success(`${selectedProducts.size} product(s) deleted successfully!`);
      setSelectedProducts(new Set());
      setShowBulkDeleteModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete products:", err);
      toast.error("Failed to delete some products");
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p._id)));
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleExport = () => {
    const exportData = products.map(product => ({
      'Name': product.name,
      'Category': product.category,
      'Style': product.style || 'N/A',
      'Color': product.color || 'N/A',
      'Price': product.price || 0,
      'Stock': product.stock || 0,
      'Available': product.available ? 'Yes' : 'No',
      'Description': product.description || 'N/A',
    }));
    
    exportToCSV(exportData, `products-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Products exported successfully');
  };

  const handleCancelEdit = () => {
    setProduct({});
    setIsEditing(false);
    setShowForm(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterStyle("");
    setFilterAvailable("");
    setCurrentPage(1);
  };

  // Get unique values for filters
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'child bedroom', label: 'Child Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'living room', label: 'Living Room' },
  ];

  const availableOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Available' },
    { value: 'false', label: 'Unavailable' },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Products Management</h1>
          <p className="text-[#A58077] text-lg">Manage your product inventory</p>
        </div>
        <TableSkeleton rows={5} columns={8} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Products Management</h1>
          <p className="text-[#A58077] text-lg">Manage your product inventory</p>
        </div>
        <div className="flex gap-3">
          {selectedProducts.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaTrash />
              Delete Selected ({selectedProducts.size})
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-[#E5CBBE] border border-[#3C3C3C] rounded-lg hover:bg-[#A58077] hover:text-white transition"
          >
            <FaDownload />
            Export CSV
          </button>
          <button
            onClick={() => {
              setProduct({});
              setIsEditing(false);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#A58077] text-white rounded-lg hover:bg-[#8B6B63] transition"
          >
            <FaPlus />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#E5CBBE]">Filters</h3>
          {(searchQuery || filterCategory || filterStyle || filterAvailable) && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#A58077] hover:text-[#E5CBBE] flex items-center gap-1"
            >
              <FaTimes />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
            onClear={() => setSearchQuery("")}
          />
          <FilterDropdown
            value={filterCategory}
            onChange={setFilterCategory}
            options={categories}
            placeholder="All Categories"
          />
          <FilterDropdown
            value={filterAvailable}
            onChange={setFilterAvailable}
            options={availableOptions}
            placeholder="Availability"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <ProductForm
            product={product}
            setProduct={setProduct}
            onChange={handleChange}
            onSubmit={handleCreateOrUpdate}
            isEditing={isEditing}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-[#2C2C2C] rounded-xl shadow-lg border border-[#3C3C3C] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={8} />
            </div>
          ) : (
            <>
              <table className="w-full table-auto text-left">
                <thead className="bg-[#A58077] text-white">
                  <tr>
                    <th className="py-3 px-4 text-sm font-semibold">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center"
                      >
                        {selectedProducts.size === products.length && products.length > 0 ? (
                          <FaCheckSquare />
                        ) : (
                          <FaSquare />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-sm font-semibold">Image</th>
                    <th className="py-3 px-4 text-sm font-semibold">Name</th>
                    <th className="py-3 px-4 text-sm font-semibold">Category</th>
                    <th className="py-3 px-4 text-sm font-semibold">Price</th>
                    <th className="py-3 px-4 text-sm font-semibold">Stock</th>
                    <th className="py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr 
                      key={item._id} 
                      className="border-b border-[#3C3C3C] hover:bg-[#1e1e1e] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleSelectProduct(item._id)}
                          className="flex items-center"
                        >
                          {selectedProducts.has(item._id) ? (
                            <FaCheckSquare className="text-[#A58077]" />
                          ) : (
                            <FaSquare className="text-[#3C3C3C]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <img
                          src={item.image || item.filePath || 'https://via.placeholder.com/48x48?text=No+Image'}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4 capitalize">{item.category}</td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(item.price || 0)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.stock > 10 ? 'bg-green-500/20 text-green-400' : 
                          item.stock > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.stock || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.available ? 'available' : 'unavailable')}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-[#1e1e1e] text-[#A58077] rounded-lg hover:bg-[#A58077] hover:text-white transition"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-xl text-[#A58077]">
                    {searchQuery || filterCategory || filterStyle || filterAvailable
                      ? 'No products found matching your criteria'
                      : 'No products found'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-[#3C3C3C] text-[#E5CBBE] rounded-lg hover:bg-[#4C4C4C] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#A58077]">
          Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Confirm Bulk Delete"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="px-4 py-2 bg-[#3C3C3C] text-[#E5CBBE] rounded-lg hover:bg-[#4C4C4C] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete {selectedProducts.size} Product(s)
            </button>
          </>
        }
      >
        <p className="text-[#A58077]">
          Are you sure you want to delete {selectedProducts.size} selected product(s)? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
