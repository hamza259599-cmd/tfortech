import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useCart, useAuth } from "../App";
import { toast } from "sonner";
import { Banknote, ArrowLeft, ShieldCheck } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [shippingSettings, setShippingSettings] = useState({
    shipping_fee: 200,
    free_shipping_minimum: 5000
  });
  const [siteContent, setSiteContent] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    shipping_address: "",
    city: "",
    phone: ""
  });

  // Fetch shipping settings and site content
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [shippingRes, contentRes] = await Promise.all([
          axios.get(`${API}/shipping`),
          axios.get(`${API}/settings/content`)
        ]);
        setShippingSettings(shippingRes.data);
        setSiteContent(contentRes.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Calculate shipping
  const isFreeShipping = shippingSettings.free_shipping_minimum > 0 && cart.total >= shippingSettings.free_shipping_minimum;
  const shippingFee = isFreeShipping ? 0 : shippingSettings.shipping_fee;
  const grandTotal = cart.total + shippingFee;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.shipping_address || !formData.city || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size
        })),
        customer_name: formData.customer_name,
        shipping_address: formData.shipping_address,
        city: formData.city,
        phone: formData.phone,
        payment_method: paymentMethod,
        total_amount: grandTotal,
        shipping_fee: shippingFee
      };

      const orderResponse = await axios.post(`${API}/orders`, orderData);
      const orderId = orderResponse.data.order_id;

      if (paymentMethod === "stripe") {
        // Create Stripe checkout session
        const checkoutResponse = await axios.post(`${API}/checkout/create-session`, {
          order_id: orderId,
          origin_url: window.location.origin
        });

        // Redirect to Stripe
        window.location.href = checkoutResponse.data.url;
      } else {
        // COD - redirect to success page
        toast.success("Order placed successfully!");
        navigate(`/order-success?order_id=${orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to cart if empty (using useEffect to avoid render-time navigation)
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart.items.length, navigate]);

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </button>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-8" data-testid="checkout-title">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Info */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">
                  Delivery Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="customer_name">Customer Name *</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="mt-1 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0]"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="shipping_address">Address *</Label>
                    <Input
                      id="shipping_address"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      placeholder="House number, street, area"
                      className="mt-1 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0]"
                      required
                      data-testid="input-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Lahore"
                      className="mt-1 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0]"
                      required
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="mt-1 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0]"
                      required
                      data-testid="input-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div 
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod" ? "border-[#FF8FAB] bg-[#FF8FAB]/5" : "border-gray-200 hover:border-[#FFD166]"
                    }`}
                    data-testid="payment-cod"
                  >
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-[#06D6A0]" />
                      </div>
                      <div>
                        <Label className="font-medium">
                          {siteContent?.payment_settings?.method_title || "Cash on Delivery (COD)"}
                        </Label>
                        <p className="text-sm text-[#6B7280]">
                          {siteContent?.payment_settings?.method_description || `Free shipping on order over Rs. ${shippingSettings.free_shipping_minimum}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24" data-testid="checkout-summary">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#1A1A1A] text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-[#6B7280]">
                          {item.quantity} x Rs. {(item.discount_price || item.price).toFixed(0)}
                          {item.discount_price && (
                            <span className="ml-1 line-through text-gray-400">Rs. {item.price.toFixed(0)}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#1A1A1A]">
                          Rs. {((item.discount_price || item.price) * item.quantity).toFixed(0)}
                        </p>
                        {item.discount_price && (
                          <p className="text-xs text-gray-400 line-through">
                            Rs. {(item.price * item.quantity).toFixed(0)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal</span>
                    <span>Rs. {cart.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Delivery</span>
                    {isFreeShipping ? (
                      <span className="text-[#06D6A0]">Free</span>
                    ) : (
                      <span>Rs. {shippingFee}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-heading text-lg font-bold text-[#1A1A1A]">Total</span>
                    <span className="font-heading text-xl font-bold text-[#FF8FAB]" data-testid="checkout-total">
                      Rs. {grandTotal.toFixed(0)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full py-6 text-lg font-medium btn-hover-lift"
                  data-testid="place-order-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Place Order
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#6B7280]">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
