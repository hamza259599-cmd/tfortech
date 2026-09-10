import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  Megaphone, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  Eye,
  MousePointer,
  Target,
  ExternalLink,
  Copy,
  Check,
  Package
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminCampaigns() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/ad-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaign data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate tracking link
  const generateTrackingLink = (campaignName, source = "google", medium = "cpc") => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaignName.toLowerCase().replace(/\s+/g, '_')
    });
    return `${baseUrl}/?${params.toString()}`;
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Sample campaign links for user
  const sampleCampaigns = [
    { name: "Google Ads - Summer Sale", source: "google", medium: "cpc" },
    { name: "Facebook - New Products", source: "facebook", medium: "social" },
    { name: "Instagram Story", source: "instagram", medium: "social" },
    { name: "WhatsApp Share", source: "whatsapp", medium: "referral" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6]"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-[#1A1A1A] flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-[#3B82F6]" />
                Ad Campaign Tracking
              </h1>
              <p className="text-gray-500 mt-1">Track your Google Ads, Facebook Ads, and other campaigns</p>
            </div>
            <Button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Ad Visitors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  All Time
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                {data?.total_ad_visitors || 0}
              </h3>
              <p className="text-gray-500 text-sm">Ad Visitors</p>
            </div>

            {/* Today's Ad Visitors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Today
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                {data?.today_ad_visitors || 0}
              </h3>
              <p className="text-gray-500 text-sm">Today's Ad Visitors</p>
            </div>

            {/* Total Conversions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  Actions
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                {data?.total_conversions || 0}
              </h3>
              <p className="text-gray-500 text-sm">Conversions</p>
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              </div>
              <h3 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                {data?.total_campaigns || 0}
              </h3>
              <p className="text-gray-500 text-sm">Campaigns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Generate Tracking Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-[#4ECDC4]" />
                Generate Tracking Links
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Use these links in your ads. When someone clicks, we'll track them!
              </p>
              
              <div className="space-y-3">
                {sampleCampaigns.map((campaign, index) => {
                  const link = generateTrackingLink(campaign.name, campaign.source, campaign.medium);
                  const linkId = `link-${index}`;
                  
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-[#1A1A1A]">{campaign.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          campaign.source === 'google' ? 'bg-blue-100 text-blue-700' :
                          campaign.source === 'facebook' ? 'bg-indigo-100 text-indigo-700' :
                          campaign.source === 'instagram' ? 'bg-pink-100 text-pink-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {campaign.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={link} 
                          readOnly 
                          className="flex-1 text-xs bg-white border rounded px-2 py-1.5 text-gray-600"
                        />
                        <button
                          onClick={() => copyLink(link, linkId)}
                          className="p-1.5 bg-[#3B82F6] text-white rounded hover:bg-[#3B82F6]/90"
                        >
                          {copiedLink === linkId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Copy these links and paste them in your Google Ads or Facebook Ads. 
                  When someone clicks, you'll see them here!
                </p>
              </div>
            </div>

            {/* Last 7 Days Ad Visitors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                Ad Visitors - Last 7 Days
              </h2>
              
              <div className="space-y-3">
                {data?.ad_last_7_days?.map((day, index) => {
                  const maxVisitors = Math.max(...(data?.ad_last_7_days?.map(d => d.visitors) || [1]), 1);
                  const percentage = (day.visitors / maxVisitors) * 100;
                  const isToday = index === data.ad_last_7_days.length - 1;
                  
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-gray-500">
                        {isToday ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className={`h-full rounded-lg transition-all duration-500 ${isToday ? 'bg-[#3B82F6]' : 'bg-[#4ECDC4]'}`}
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                          {day.visitors}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FFD166]" />
              Campaign Performance
            </h2>
            
            {data?.campaigns?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Source</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Visitors</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Cart Adds</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Purchases</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Products Viewed</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((campaign, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#1A1A1A]">{campaign.campaign_name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.utm_source === 'google' ? 'bg-blue-100 text-blue-700' :
                            campaign.utm_source === 'facebook' ? 'bg-indigo-100 text-indigo-700' :
                            campaign.utm_source === 'instagram' ? 'bg-pink-100 text-pink-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.utm_source || 'Direct'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-[#1A1A1A]">{campaign.total_visitors}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-purple-600 font-medium">{campaign.cart_adds || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-green-600 font-medium">{campaign.purchases || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-600">{campaign.products_viewed?.length || 0}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {campaign.total_visitors > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              ✅ Working
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                              Waiting
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No campaigns tracked yet</p>
                <p className="text-sm mt-1">Use the tracking links above in your ads to start tracking!</p>
              </div>
            )}
          </div>

          {/* Products Viewed by Ad Visitors */}
          {data?.campaigns?.some(c => c.products_viewed?.length > 0) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#4ECDC4]" />
                Products Viewed by Ad Visitors
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.campaigns.flatMap(c => c.products_viewed || []).slice(0, 9).map((product, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#1A1A1A] truncate">
                        {product.product_name || product.product_id}
                      </p>
                      <p className="text-xs text-gray-500">Viewed by ad visitor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Use Guide */}
          <div className="mt-6 p-6 bg-gradient-to-r from-[#3B82F6]/10 to-[#4ECDC4]/10 rounded-2xl border border-[#3B82F6]/20">
            <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              📖 How to Track Your Ads
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li><span className="font-medium">1.</span> Copy one of the tracking links above</li>
              <li><span className="font-medium">2.</span> Use it as your ad's destination URL in Google Ads, Facebook Ads, etc.</li>
              <li><span className="font-medium">3.</span> When someone clicks your ad, they'll be tracked here automatically!</li>
              <li><span className="font-medium">4.</span> You'll see which products they viewed and if they made a purchase</li>
            </ol>
            <p className="mt-3 text-xs text-gray-500">
              <strong>Note:</strong> The page auto-refreshes every 30 seconds. Data shows up in real-time!
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
