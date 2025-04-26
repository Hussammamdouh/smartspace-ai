import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    type: "",
    price: "",
    stock: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setProduct({ ...product, file: e.target.files[0] });
    } else {
      setProduct({ ...product, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.name || !product.price || !product.stock || !product.file) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in product) {
        formData.append(key, product[key]);
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/inventory`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            placeholder="Enter product name"
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
            placeholder="Enter short description"
          ></textarea>
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
          <label className="block mb-2">Price ($) *</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            placeholder="Enter price"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block mb-2">Stock *</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-[#2c2c2c] text-[#E5CBBE] focus:outline-none"
            placeholder="Enter stock quantity"
          />
        </div>

        {/* File */}
        <div>
          <label className="block mb-2">Upload Image *</label>
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
          {loading ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
