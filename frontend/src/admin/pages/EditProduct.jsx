import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    type: "",
    price: "",
    stock: "",
    filePath: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/${id}`);
        setProduct(res.data.data || res.data);
      } catch (err) {
        toast.error("Failed to fetch product.");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFile(e.target.files[0]);
    } else {
      setProduct({ ...product, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("type", product.type);
      formData.append("price", product.price);
      formData.append("stock", product.stock);
      if (file) {
        formData.append("file", file);
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/inventory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            rows="4"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-2">Type</label>
          <select
            name="type"
            value={product.type}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
          >
            <option value="">Select Type</option>
            <option value="Furniture">Furniture</option>
            <option value="Lighting">Lighting</option>
            <option value="Decor">Decor</option>
            <option value="Office">Office</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2">Price ($)</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block mb-2">Stock</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            required
          />
        </div>

        {/* Current Image */}
        {product.filePath && (
          <div className="flex items-center gap-4">
            <img src={product.filePath} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
            <p className="text-[#A58077]">Current Image</p>
          </div>
        )}

        {/* Upload New Image */}
        <div>
          <label className="block mb-2">Upload New Image (optional)</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleChange}
            className="text-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
