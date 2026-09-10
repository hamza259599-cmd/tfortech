import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { useAuth } from "../App";
import { User, Mail, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusColors = {
  pending: "bg-[#FFD166]/10 text-[#FFD166]",
  confirmed: "bg-[#4CC9F0]/10 text-[#4CC9F0]",
  shipped: "bg-[#06D6A0]/10 text-[#06D6A0]",
  delivered: "bg-[#06D6A0]/10 text-[#06D6A0]",
  cancelled: "bg-red-100 text-red-600"
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Kya aap yeh order cancel karna chahte hain?")) return;
    
    setCancellingOrder(orderId);
    try {
      await axios.post(`${API}/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.detail || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-8" data-testid="profile-title">
          My Profile
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6" data-testid="user-info">
              <div className="text-center">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-[#3B82F6]" />
                  </div>
                )}
                
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-1">
                  {user?.name}
                </h2>
                <p className="text-[#6B7280] flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                
                {user?.is_admin && (
                  <span className="inline-block mt-4 bg-[#FFD166] text-[#1A1A1A] px-4 py-1 rounded-full text-sm font-medium">
                    Admin
                  </span>
                )}
              </div>

              {user?.is_admin && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link to="/admin">
                    <Button className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white rounded-full">
                      Admin Panel
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-[#3B82F6]" />
                My Orders
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 h-32 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-[#1A1A1A] mb-2">
                    No orders yet
                  </h3>
                  <p className="text-[#6B7280] mb-4">Start shopping now!</p>
                  <Link to="/products">
                    <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4" data-testid="orders-list">
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Clock;
                    return (
                      <div 
                        key={order.order_id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-[#FFD166] transition-colors"
                        data-testid={`order-${order.order_id}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="text-sm text-[#6B7280] mb-1">
                              Order #{order.order_id.slice(-8)}
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusLabels[order.status]}
                            </span>
                            <span className="font-heading font-bold text-[#3B82F6]">
                              Rs. {order.total_amount.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <Link 
                              key={idx}
                              to={`/product/${item.product_id}`}
                              className="block hover:opacity-80 transition-opacity"
                              data-testid={`order-item-link-${item.product_id}`}
                            >
                              <img 
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                title={item.name}
                              />
                            </Link>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[#6B7280] font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        
                        {/* Product Names with Links */}
                        <div className="mt-2 space-y-1">
                          {order.items.map((item, idx) => (
                            <Link 
                              key={idx}
                              to={`/product/${item.product_id}`}
                              className="block text-sm text-[#1A1A1A] hover:text-[#3B82F6] transition-colors"
                              data-testid={`order-item-name-link-${item.product_id}`}
                            >
                              {item.name} × {item.quantity}
                            </Link>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-[#6B7280]">
                          <p>{order.shipping_address}, {order.city}</p>
                          <p className="mt-1">
                            Payment: {order.payment_method === "cod" ? "Cash on Delivery" : "Card"}
                            {order.payment_status === "paid" && (
                              <span className="text-[#06D6A0] ml-2">✓ Paid</span>
                            )}
                          </p>
                          
                          {/* Cancel Button - Only for pending/processing orders */}
                          {(order.status === "pending" || order.status === "processing") && (
                            <button
                              onClick={() => handleCancelOrder(order.order_id)}
                              disabled={cancellingOrder === order.order_id}
                              className="mt-3 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {cancellingOrder === order.order_id ? "Cancelling..." : "Cancel Order"}
                            </button>
                          )}
                          
                          {/* Show cancellation info */}
                          {order.status === "cancelled" && order.cancelled_at && (
                            <p className="mt-2 text-red-500">
                              Cancelled on {new Date(order.cancelled_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
