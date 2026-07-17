import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { useCart, useAuth } from "../App";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [shippingSettings, setShippingSettings] = useState({
    shipping_fee: 200,
    free_shipping_minimum: 5000
  });

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const response = await axios.get(`${API}/shipping`);
        setShippingSettings(response.data);
      } catch (error) {
        console.error("Error fetching shipping:", error);
      }
    };
    fetchShipping();
  }, []);

  const handleQuantityChange = async (productId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      await removeFromCart(productId);
      toast.success("Item removed");
    } else {
      await updateQuantity(productId, newQty);
    }
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
    toast.success("Item removed");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Calculate shipping
  const isFreeShipping = shippingSettings.free_shipping_minimum > 0 && cart.total >= shippingSettings.free_shipping_minimum;
  const shippingFee = isFreeShipping ? 0 : shippingSettings.shipping_fee;
  const grandTotal = cart.total + shippingFee;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 h-32 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-8" data-testid="cart-title">
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl">
            <div className="w-24 h-24 bg-[#FFD166]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-[#FFD166]" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-3">
              Your cart is empty
            </h2>
            <p className="text-[#6B7280] mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link to="/products">
              <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-2xl p-4 sm:p-6 flex gap-4 sm:gap-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.product_id}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.image_url || "https://placehold.co/200x200?text=No+Image"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="font-heading text-lg font-semibold text-[#1A1A1A] hover:text-[#FF8FAB] transition-colors truncate">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {item.size && (
                      <p className="text-sm text-[#6B7280] mt-1">
                        Size: {item.size}
                      </p>
                    )}

                    {item.discount_price ? (
                      <div className="flex items-center gap-2 mt-2">
                        <p className="font-heading text-lg font-bold text-[#FF8FAB]">
                          Rs. {item.discount_price.toFixed(0)}
                        </p>
                        <p className="text-sm text-gray-400 line-through">
                          Rs. {item.price.toFixed(0)}
                        </p>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          {Math.round(((item.price - item.discount_price) / item.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <p className="font-heading text-lg font-bold text-[#FF8FAB] mt-2">
                        Rs. {item.price.toFixed(0)}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          data-testid={`cart-minus-${item.product_id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          data-testid={`cart-plus-${item.product_id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`cart-remove-${item.product_id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-heading text-xl font-bold text-[#1A1A1A]">
                      Rs. {((item.discount_price || item.price) * item.quantity).toFixed(0)}
                    </p>
                    {item.discount_price && (
                      <p className="text-sm text-gray-400 line-through">
                        Rs. {(item.price * item.quantity).toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24" data-testid="order-summary">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>Rs. {cart.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </span>
                    {isFreeShipping ? (
                      <span className="text-[#06D6A0] font-medium">FREE</span>
                    ) : (
                      <span>Rs. {shippingFee}</span>
                    )}
                  </div>
                  
                  {/* Free shipping progress */}
                  {!isFreeShipping && shippingSettings.free_shipping_minimum > 0 && (
                    <div className="bg-[#FFF9E6] rounded-lg p-3 text-sm">
                      <p className="text-[#B8860B]">
                        🚚 Add Rs. {(shippingSettings.free_shipping_minimum - cart.total).toFixed(0)} more for FREE delivery!
                      </p>
                      <div className="w-full bg-[#FFD166]/30 rounded-full h-2 mt-2">
                        <div 
                          className="bg-[#FFD166] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((cart.total / shippingSettings.free_shipping_minimum) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-heading text-lg font-bold text-[#1A1A1A]">Total</span>
                    <span className="font-heading text-xl font-bold text-[#FF8FAB]" data-testid="cart-total">
                      Rs. {grandTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full py-6 text-lg"
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Link to="/products" className="block text-center mt-4 text-[#6B7280] hover:text-[#FF8FAB] transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
