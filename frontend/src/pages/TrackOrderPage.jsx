import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Search, Package, CheckCircle2, Truck, Home, XCircle, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await axios.get(`${API}/orders/track`, {
        params: { order_id: orderId.trim(), email: email.trim() },
      });
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <Layout>
      <SEO
        title="Track Your Order - T For Tech"
        description="Track your T For Tech order status by entering your Order ID and email address."
        url="/track-order"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: 'var(--color-primary)'}}>
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">Track Your Order</h1>
          <p className="text-gray-500">Enter your Order ID and email address to see your order status.</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-[#1A1A1A]">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. order_a1b2c3d4e5f6"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-[#1A1A1A]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white font-semibold rounded-full py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Tracking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" /> Track Order
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-8 flex items-center gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold text-[#1A1A1A]">{order.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Placed On</p>
                <p className="font-semibold text-[#1A1A1A]">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold text-[#1A1A1A]">Rs. {order.total_amount}</p>
              </div>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 rounded-xl p-4 mb-6">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">This order has been cancelled.</span>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-8 px-2">
                {STATUS_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx <= currentStepIndex;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {idx > 0 && (
                        <div
                          className="absolute top-5 right-1/2 w-full h-0.5"
                          style={{ backgroundColor: idx <= currentStepIndex ? 'var(--color-primary)' : '#E5E7EB', zIndex: 0 }}
                        />
                      )}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative z-10 mb-2"
                        style={{ backgroundColor: isDone ? 'var(--color-primary)' : '#E5E7EB' }}
                      >
                        <StepIcon className={`w-5 h-5 ${isDone ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <span className={`text-xs text-center font-medium ${isDone ? "text-[#1A1A1A]" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-3">Items</h3>
              <div className="space-y-3">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#1A1A1A]">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-[#1A1A1A]">Rs. {item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Shipping Address</p>
                <p className="text-[#1A1A1A] font-medium">{order.shipping_address}, {order.city}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="text-[#1A1A1A] font-medium capitalize">{order.payment_method}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
