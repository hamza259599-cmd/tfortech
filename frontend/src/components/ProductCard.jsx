import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useCart } from "../App";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductCard({ product, categories = [] }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get category name from categories list
  const getCategoryName = () => {
    if (!product.category) return "General";
    const category = categories.find(c => 
      (c.category_id || c.id) === product.category || 
      c.name?.toLowerCase() === product.category?.toLowerCase()
    );
    return category?.name || product.category.replace(/^cat_/i, '').replace(/_/g, ' ');
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product is out of stock
    if (product.stock === 0 || product.is_sold_out) {
      toast.error("This product is out of stock");
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const success = await addToCart(product.product_id, 1);
      if (success) {
        toast.success("Added to cart! 🛒");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await axios.post(`${API}/wishlist/remove`, { product_id: product.product_id });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`${API}/wishlist/add`, { product_id: product.product_id });
        setIsWishlisted(true);
        toast.success("Added to wishlist! ❤️");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.product_id}`);
  };

  // Calculate discount percentage
  const discountPercent = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.product_id}`}>
          <img 
            src={product.image_url || "https://placehold.co/400x400/F8F9FA/6B7280?text=No+Image"} 
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}

        {/* Out of Stock Badge */}
        {(product.stock === 0 || product.is_sold_out) && (
          <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0 || product.is_sold_out}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${
              product.stock === 0 || product.is_sold_out
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white hover:bg-[var(--color-primary)] hover:text-white'
            }`}
            title={product.stock === 0 || product.is_sold_out ? "Out of Stock" : "Add to Cart"}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>

          {/* Wishlist/Favorite */}
          <button
            onClick={handleWishlist}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 ${
              isWishlisted 
                ? "bg-red-500 text-white" 
                : "bg-white hover:bg-red-500 hover:text-white"
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {/* Quick View */}
          <button
            onClick={handleView}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <Link to={`/product/${product.product_id}`} className="block p-4">
        <span className="text-xs text-[#6B7280] uppercase tracking-wide">
          {getCategoryName()}
        </span>
        <h3 className="font-semibold text-[#1A1A1A] mt-1 line-clamp-2 min-h-[2.5rem] text-sm">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          {product.discount_price ? (
            <>
              <span className="font-bold text-[var(--color-primary)] text-lg">
                Rs. {product.discount_price.toFixed(0)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                Rs. {product.price.toFixed(0)}
              </span>
            </>
          ) : (
            <span className="font-bold text-[var(--color-primary)] text-lg">
              Rs. {product.price.toFixed(0)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
