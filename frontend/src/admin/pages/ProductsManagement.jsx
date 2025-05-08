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
      <div className="mt-12 overflow-x-auto">
        {loading ? (
          <div>Loading products...</div>
        ) : (
          <table className="w-full table-auto text-left mt-6">
            <thead className="bg-[#A58077] text-white">
              <tr>
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Stock</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item._id} className="border-b border-gray-700">
                  <td className="py-2 px-4">
                    <img
                      src={item.filePath}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">{item.type}</td>
                  <td className="py-2 px-4">${item.price}</td>
                  <td className="py-2 px-4">{item.stock}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-[#E5CBBE] text-[#181818] rounded hover:bg-[#A58077] hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
