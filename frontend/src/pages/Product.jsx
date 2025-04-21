import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Loader from "../components/Loader";
import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";

const SingleProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/${id}`);
        setProduct(response.data.data || response.data); // Flexible for both formats
      } catch {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleWishlist = () => {
    setWishlist((prev) =>
      prev.includes(product._id)
        ? prev.filter((pid) => pid !== product._id)
        : [...prev, product._id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={80} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8 animate-fade">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image */}
        <div className="relative bg-[#E5CBBE] p-4 rounded-xl shadow-lg">
          <img
            src={product.filePath}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />

          <button
            className="absolute top-4 right-4 bg-white p-3 rounded-full text-[#A58077] hover:text-[#181818] transition"
            onClick={toggleWishlist}
          >
            {wishlist.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold leading-tight">{product.name}</h1>
          <p className="text-lg text-[#A58077]">{product.description}</p>

          <div className="text-2xl font-bold text-white">
            ${product.price.toFixed(2)}
          </div>

          <div className="text-md">
            <span className="font-semibold">Category:</span> {product.type}
          </div>

          <div className="text-md">
            <span className="font-semibold">Availability:</span>{" "}
            {product.stock > 0 ? (
              <span className="text-green-400">In Stock ({product.stock})</span>
            ) : (
              <span className="text-red-400">Out of Stock</span>
            )}
          </div>

          {/* Optional 3D Viewer */}
          {product.modelPath && (
            <div className="bg-[#E5CBBE] p-4 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-3 text-[#181818]">3D Preview</h3>
              <iframe
                src={product.modelPath}
                title="3D Model"
                className="w-full h-64 rounded-lg"
              ></iframe>
            </div>
          )}

<button
  className="w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all"
  disabled={product.stock === 0}
  onClick={() => {
    addToCart(product);
    console.log("Added to cart:", product); // ✅ Debug log
  }}
>
  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
</button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
