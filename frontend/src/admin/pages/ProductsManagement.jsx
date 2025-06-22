import { useEffect, useState } from "react";
import axios from "axios";
import ProductForm from "../components/ProductForm";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setProducts(res.data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
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
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("type", product.type);
      formData.append("stock", product.stock);

      if (product.file && typeof product.file !== "string") {
        formData.append("file", product.file);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      if (isEditing) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/inventory/${product._id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/inventory`,
          formData,
          config
        );
      }

      setProduct({});
      setIsEditing(false);
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleEdit = (item) => {
    setProduct(item);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <h1 className="text-4xl font-bold mb-8">Products Management</h1>

      {/* Form */}
      <ProductForm
        product={product}
        setProduct={setProduct}
        onChange={handleChange}
        onSubmit={handleCreateOrUpdate}
        isEditing={isEditing}
      />

      {/* Product Table */}
      <div className="mt-12">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A58077]"></div>
            <span className="ml-3">Loading products...</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#2c2c2c] rounded-xl shadow-lg">
            <table className="w-full table-auto text-left">
              <thead className="bg-[#A58077] text-white">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold">Image</th>
                  <th className="py-3 px-4 text-sm font-semibold">Name</th>
                  <th className="py-3 px-4 text-sm font-semibold">Type</th>
                  <th className="py-3 px-4 text-sm font-semibold">Price</th>
                  <th className="py-3 px-4 text-sm font-semibold">Stock</th>
                  <th className="py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item._id} className="border-b border-gray-700 hover:bg-[#333] transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={item.filePath}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">{item.type}</td>
                    <td className="py-3 px-4">${item.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.stock > 10 ? 'bg-green-500 text-white' : 
                        item.stock > 0 ? 'bg-yellow-500 text-white' : 
                        'bg-red-500 text-white'
                      }`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-[#E5CBBE] text-[#181818] rounded hover:bg-[#A58077] hover:text-white transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-[#A58077]">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
