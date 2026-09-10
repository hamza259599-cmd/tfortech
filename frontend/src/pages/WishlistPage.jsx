import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart, useAuth } from "../App";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/wishlist/remove`, 
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter(p => p.product_id !== productId));
      toast.success("Removed from favourites");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product.product_id, 1);
    if (success) {
      toast.success("Added to cart!");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#3B82F6] border-t-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Login to see your favourites</h2>
            <p className="text-gray-500 mb-6">Please login to view and manage your wishlist</p>
            <Link to="/login">
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              My Favourites
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} {products.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No favourites yet</h2>
            <p className="text-gray-500 mb-6">Start adding products to your wishlist!</p>
            <Link to="/products">
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <Link to={`/product/${product.product_id}`}>
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url || product.image_urls?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount_price && product.discount_price < product.price && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                      </span>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link to={`/product/${product.product_id}`}>
                    <h3 className="font-medium text-[#1A1A1A] line-clamp-2 hover:text-[#3B82F6] transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-[#3B82F6]">
                      Rs. {product.discount_price || product.price}
                    </span>
                    {product.discount_price && product.discount_price < product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs. {product.price}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white text-sm"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => removeFromWishlist(product.product_id)}
                      variant="outline"
                      className="px-3 border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
