import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { 
  DollarSign, ShoppingCart, Package, TrendingUp, Eye, 
  ArrowUpRight, Clock, CheckCircle, XCircle, Users, Calendar, ClipboardList, Database
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_products: 0,
    total_users: 0,
    total_revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const [liveTime, setLiveTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const weatherCodeMap = {
      0: "Clear", 1: "Mostly Clear", 2: "Partly Cloudy", 3: "Cloudy",
      45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
      61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
      80: "Showers", 81: "Showers", 82: "Heavy Showers",
      95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm"
    };
    const loadWeather = () => {
      fetch("https://api.open-meteo.com/v1/forecast?latitude=31.5497&longitude=74.3436&current_weather=true")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.current_weather) {
            setWeather({
              temp: Math.round(data.current_weather.temperature),
              label: weatherCodeMap[data.current_weather.weathercode] || ""
            });
          }
        })
        .catch(() => setWeather({ temp: "--", label: "Unavailable" }));
    };
    loadWeather();
    const weatherTimer = setInterval(loadWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats
      const statsRes = await axios.get(`${API}/admin/stats`, { headers });
      setStats(statsRes.data);

      // Fetch recent orders
      const ordersRes = await axios.get(`${API}/admin/orders`, { headers });
      setRecentOrders((ordersRes.data || []).slice(0, 5));

      // Fetch top products - handle both old and new API formats
      const productsRes = await axios.get(`${API}/products?limit=5`);
      const products = productsRes.data.products || productsRes.data || [];
      setTopProducts(products.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Total Revenue", 
      value: `Rs. ${stats.total_revenue?.toLocaleString() || 0}`, 
      icon: DollarSign, 
      color: "bg-green-500",
      change: "+12%",
      changeType: "positive"
    },
    { 
      label: "Total Orders", 
      value: stats.total_orders, 
      icon: ShoppingCart, 
      color: "bg-blue-500",
      change: "+8%",
      changeType: "positive"
    },
    { 
      label: "Total Products", 
      value: stats.total_products, 
      icon: Package, 
      color: "bg-purple-500",
      change: "+3%",
      changeType: "positive"
    },
    { 
      label: "Total Customers", 
      value: stats.total_users, 
      icon: Users, 
      color: "bg-orange-500",
      change: "+15%",
      changeType: "positive"
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      case "pending": return "bg-gray-100 text-gray-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your store.</p>
            </div>
                      <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Live Time</p>
              <p className="font-medium text-[#1A1A1A]">{liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <div className="w-10 h-10 bg-[#FF8FAB]/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#FF8FAB]" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Lahore Weather</p>
              <p className="font-medium text-[#1A1A1A]">{weather ? `${weather.temp}°C ${weather.label}` : 'Loading...'}</p>
            </div>
            <div className="w-10 h-10 bg-[#FFD166]/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#FFD166]" />
            </div>
          </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">Recent Orders</h2>
                    <p className="text-sm text-gray-500">Latest 5 orders</p>
                  </div>
                  <Link to="/admin/orders">
                    <Button variant="outline" size="sm" className="text-[#FF8FAB] border-[#FF8FAB]">
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.order_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#FF8FAB]/10 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-[#FF8FAB]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">#{order.order_id?.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1A1A1A]">Rs. {order.total_amount?.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">Top Products</h2>
                    <p className="text-sm text-gray-500">Best selling items</p>
                  </div>
                  <Link to="/admin/products">
                    <Button variant="outline" size="sm" className="text-[#FF8FAB] border-[#FF8FAB]">
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : topProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No products yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product) => (
                      <div key={product.product_id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1A1A1A] truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#FF8FAB]">Rs. {product.discount_price || product.price}</p>
                          <p className="text-xs text-gray-500">{product.stock} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-[#FF8FAB] to-[#FFD166] rounded-2xl p-6 text-white">
            <h3 className="font-heading text-xl font-bold mb-2">Quick Actions</h3>
            <p className="text-white/80 mb-4">Manage your store efficiently</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/products/new">
                <Button className="bg-white text-[#FF8FAB] hover:bg-white/90">
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/data-transfer">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Database className="w-4 h-4 mr-2" />
                  Data Transfer
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
