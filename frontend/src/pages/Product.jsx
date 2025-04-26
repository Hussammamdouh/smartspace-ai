import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Loader from "../components/Loader";
import { CartContext } from "../contexts/CartContext";

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/${id}`);
        const currentProduct = data.data || data;
        setProduct(currentProduct);

        // Fetch related products by type
        const relatedRes = await axios.get(`${import.meta.env.VITE_API_URL}/inventory`, {
          params: { type: currentProduct.type, limit: 6 },
        });
        setRelatedProducts(
          (relatedRes.data.data || []).filter((item) => item._id !== currentProduct._id)
        );
      } catch {
        setError("Failed to load the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold">
        {error || "Product not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-6 lg:p-12 space-y-16">
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left: Product Image */}
        <div className="relative bg-[#2c2c2c] p-6 rounded-xl shadow-xl">
          <img
            src={product.filePath}
            alt={product.name || "Product Image"}
            className="w-full h-[500px] object-cover rounded-lg"
          />
          <button
            className="absolute top-4 right-4 bg-white p-3 rounded-full text-[#A58077] hover:text-[#181818] transition"
            onClick={toggleWishlist}
            aria-label="Toggle Wishlist"
          >
            {wishlist.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col justify-center gap-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-3">{product.name}</h1>
            <p className="text-lg text-[#A58077] mb-6">{product.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-white">${product.price?.toFixed(2)}</span>
              {product.stock > 0 ? (
                <span className="text-green-400 font-semibold">In Stock ({product.stock})</span>
              ) : (
                <span className="text-red-400 font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-md">
              <span className="font-semibold">Category:</span> {product.type || "N/A"}
            </div>
            <div className="text-md">
              <span className="font-semibold">SKU:</span> {product._id.slice(0, 8)}
            </div>
          </div>

          {/* Optional 3D Model Viewer */}
          {product.modelPath && (
            <div className="bg-[#E5CBBE] p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2 text-[#181818]">3D Preview</h3>
              <iframe
                src={product.modelPath}
                title="3D Model Preview"
                className="w-full h-64 rounded-lg"
              ></iframe>
            </div>
          )}

          <button
            className="mt-6 w-full h-14 bg-[#A58077] text-white rounded-lg text-lg font-semibold hover:bg-[#E5CBBE] hover:text-[#181818] transition-all"
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-[#A58077] scrollbar-track-[#181818]">
            {relatedProducts.map((item) => (
              <div
                key={item._id}
                className="min-w-[250px] bg-[#2c2c2c] rounded-lg p-4 shadow-md hover:scale-105 transition cursor-pointer"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <img
                  src={item.filePath}
                  alt={item.name}
                  className="h-40 w-full object-cover rounded mb-4"
                />
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-[#A58077] text-sm mt-1">${item.price?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SingleProductPage;