import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import ProductForm from "../components/ProductForm";
import { toast } from "react-hot-toast";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter
} from "react-icons/fa";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get('/inventory');
      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      
      // Optional fields
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

  const handleCancelEdit = () => {
    setProduct({});
    setIsEditing(false);
    setShowForm(false);
  };

  // Filter and search products
  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || item.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(products.map(item => item.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A58077] mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Products Management</h1>
        <button
          onClick={() => {
            setProduct({});
            setIsEditing(false);
            setShowForm(true);
          }}
          className="bg-[#A58077] text-white px-4 py-2 rounded-lg hover:bg-[#8B6B63] transition flex items-center gap-2"
        >
          <FaPlus />
          Add New Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2c2c2c] border border-[#A58077] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077]"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A58077]" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 bg-[#2c2c2c] border border-[#A58077] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A58077] appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
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
        <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-[#2c2c2c] rounded-xl shadow-lg border border-[#3c3c3c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead className="bg-[#A58077] text-white">
              <tr>
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
              {filteredProducts.map((item) => (
                <tr key={item._id} className="border-b border-gray-700 hover:bg-[#333] transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={item.filePath || item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                      }}
                    />
                  </td>
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">${item.price?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.stock > 10 ? 'bg-green-500 text-white' : 
                      item.stock > 0 ? 'bg-yellow-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-[#E5CBBE] text-[#181818] rounded hover:bg-[#A58077] hover:text-white transition"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-[#A58077]">
              {searchQuery || filterCategory ? 'No products found matching your criteria' : 'No products found'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2c2c2c] p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-[#E5CBBE]">Confirm Delete</h3>
            <p className="text-[#A58077] mb-6">
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-[#3c3c3c] text-[#E5CBBE] rounded hover:bg-[#4c4c4c] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
