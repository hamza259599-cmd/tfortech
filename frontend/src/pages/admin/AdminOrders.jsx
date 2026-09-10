import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Clock, CheckCircle, Truck, XCircle, Package, ClipboardList, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusColors = {
  pending: "bg-[#FFD166]/10 text-[#FFD166] border-[#FFD166]",
  confirmed: "bg-[#4CC9F0]/10 text-[#4CC9F0] border-[#4CC9F0]",
  processing: "bg-[#9B59B6]/10 text-[#9B59B6] border-[#9B59B6]",
  shipped: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]",
  delivered: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]",
  cancelled: "bg-red-100 text-red-600 border-red-600"
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const response = await axios.get(`${API}/admin/orders${params}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Something went wrong");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { 
        status: "cancelled",
        reason: "Cancelled by admin"
      });
      toast.success("Order cancelled");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;

    try {
      await axios.delete(`${API}/admin/orders/${orderId}`);
      // Update UI immediately without requiring a manual refresh
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
      toast.success("Deleted successfully.");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Unable to delete. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A]" data-testid="orders-title">
              Orders Management
            </h1>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="filter-status">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <ClipboardList className="w-16 h-16 text-[#6B7280] mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold text-[#1A1A1A] mb-2">
                No orders found
              </h3>
              <p className="text-[#6B7280]">
                {filterStatus !== "all" ? "Try changing the filter" : "No orders have been placed yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="orders-list">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <div 
                    key={order.order_id}
                    className="bg-white rounded-2xl p-6"
                    data-testid={`order-${order.order_id}`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-heading font-semibold text-[#1A1A1A]">
                          Order #{order.order_id.slice(-8)}
                        </p>
                        <p className="text-sm text-[#6B7280]">
                          {new Date(order.created_at).toLocaleDateString()} - {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-heading text-xl font-bold text-[#3B82F6]">
                          Rs. {order.total_amount.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {order.items.map((item, idx) => (
                        <Link 
                          key={idx} 
                          to={`/product/${item.product_id}`}
                          target="_blank"
                          className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors group"
                        >
                          <img 
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1 group-hover:text-[#3B82F6]">
                              {item.name}
                              <ExternalLink className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100" />
                            </p>
                            <p className="text-xs text-[#6B7280]">x{item.quantity} {item.size && `• Size: ${item.size}`}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-[#6B7280]">Customer Name:</p>
                          <p className="font-medium text-[#1A1A1A]">{order.customer_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">Delivery Address:</p>
                          <p className="font-medium text-[#1A1A1A]">{order.shipping_address}, {order.city}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">Phone:</p>
                          <p className="font-medium text-[#1A1A1A]">{order.phone}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-[#6B7280]">Payment: </span>
                        <span className="font-medium">{order.payment_method === "cod" ? "Cash on Delivery" : "Card"}</span>
                        {order.payment_status === "paid" && (
                          <span className="text-[#06D6A0] ml-2">✓ Paid</span>
                        )}
                      </div>
                      {order.status === "cancelled" && order.cancelled_at && (
                        <div className="mt-2 text-sm text-red-500">
                          Cancelled on {new Date(order.cancelled_at).toLocaleDateString()}
                          {order.cancelled_by && ` by ${order.cancelled_by}`}
                        </div>
                      )}
                    </div>

                    {/* Status Control */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusColors[order.status]}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusLabels[order.status]}
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <button
                            onClick={() => handleCancelOrder(order.order_id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                        
                        <Select 
                          value={order.status} 
                          onValueChange={(v) => handleStatusUpdate(order.order_id, v)}
                          disabled={order.status === "cancelled"}
                        >
                          <SelectTrigger className="w-[180px]" data-testid={`status-select-${order.order_id}`}>
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>

                        <button
                          onClick={() => handleDeleteOrder(order.order_id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          data-testid={`delete-order-${order.order_id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
