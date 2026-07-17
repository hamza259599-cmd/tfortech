import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet, 
  TrendingUp, 
  Eye,
  RefreshCw,
  Calendar,
  Globe
} from "lucide-react";
import { Button } from "../../components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchAnalytics(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-8 h-8" />;
      case 'tablet': return <Tablet className="w-8 h-8" />;
      case 'desktop': return <Monitor className="w-8 h-8" />;
      default: return <Globe className="w-8 h-8" />;
    }
  };

  const getDeviceColor = (type) => {
    switch (type) {
      case 'mobile': return 'bg-blue-500';
      case 'tablet': return 'bg-purple-500';
      case 'desktop': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const totalDevices = analytics ? 
    analytics.device_breakdown.mobile + 
    analytics.device_breakdown.tablet + 
    analytics.device_breakdown.desktop : 0;

  const getPercentage = (count) => {
    if (totalDevices === 0) return 0;
    return Math.round((count / totalDevices) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8FAB]"></div>
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
                <TrendingUp className="w-8 h-8 text-[#FF8FAB]" />
                Visitor Analytics
              </h1>
              <p className="text-gray-500 mt-1">Track your website visitors in real-time</p>
            </div>
            <Button 
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today's Visitors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-[#FF8FAB]/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-[#FF8FAB]" />
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Today
                </span>
              </div>
              <h3 className="text-4xl font-bold text-[#1A1A1A] mb-1">
                {analytics?.today_visitors || 0}
              </h3>
              <p className="text-gray-500 text-sm">Visitors Today</p>
            </div>

            {/* Total Unique Visitors */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-[#4ECDC4]/10 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-[#4ECDC4]" />
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  All Time
                </span>
              </div>
              <h3 className="text-4xl font-bold text-[#1A1A1A] mb-1">
                {analytics?.total_unique_visitors || 0}
              </h3>
              <p className="text-gray-500 text-sm">Unique Visitors</p>
            </div>

            {/* Total Page Views */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-[#FFD166]/10 rounded-xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-[#FFD166]" />
                </div>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                  Total
                </span>
              </div>
              <h3 className="text-4xl font-bold text-[#1A1A1A] mb-1">
                {analytics?.total_visits || 0}
              </h3>
              <p className="text-gray-500 text-sm">Total Visits</p>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Device Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#4ECDC4]" />
                Device Breakdown
              </h2>
              
              <div className="space-y-4">
                {/* Mobile */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#1A1A1A]">Mobile</span>
                      <span className="text-sm text-gray-500">
                        {analytics?.device_breakdown?.mobile || 0} visits ({getPercentage(analytics?.device_breakdown?.mobile || 0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(analytics?.device_breakdown?.mobile || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tablet */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Tablet className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#1A1A1A]">Tablet</span>
                      <span className="text-sm text-gray-500">
                        {analytics?.device_breakdown?.tablet || 0} visits ({getPercentage(analytics?.device_breakdown?.tablet || 0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(analytics?.device_breakdown?.tablet || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#1A1A1A]">Desktop</span>
                      <span className="text-sm text-gray-500">
                        {analytics?.device_breakdown?.desktop || 0} visits ({getPercentage(analytics?.device_breakdown?.desktop || 0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(analytics?.device_breakdown?.desktop || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics?.device_breakdown?.mobile || 0}</div>
                    <div className="text-xs text-gray-500">Mobile</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics?.device_breakdown?.tablet || 0}</div>
                    <div className="text-xs text-gray-500">Tablet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics?.device_breakdown?.desktop || 0}</div>
                    <div className="text-xs text-gray-500">Desktop</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last 7 Days Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF8FAB]" />
                Last 7 Days
              </h2>
              
              <div className="space-y-3">
                {analytics?.last_7_days?.map((day, index) => {
                  const maxVisitors = Math.max(...(analytics?.last_7_days?.map(d => d.visitors) || [1]));
                  const percentage = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0;
                  const isToday = index === analytics.last_7_days.length - 1;
                  
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-500">
                        {isToday ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div 
                          className={`h-full rounded-lg transition-all duration-500 ${isToday ? 'bg-[#FF8FAB]' : 'bg-[#4ECDC4]'}`}
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

          {/* Recent Visitors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FFD166]" />
              Recent Visitors
            </h2>
            
            {analytics?.recent_visitors?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Visitor ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Device</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Browser</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Page</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_visitors.map((visitor, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                          {visitor.visitor_id?.substring(0, 12)}...
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            visitor.device_type === 'mobile' ? 'bg-blue-100 text-blue-700' :
                            visitor.device_type === 'tablet' ? 'bg-purple-100 text-purple-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {visitor.device_type === 'mobile' ? <Smartphone className="w-3 h-3" /> :
                             visitor.device_type === 'tablet' ? <Tablet className="w-3 h-3" /> :
                             <Monitor className="w-3 h-3" />}
                            {visitor.device_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{visitor.browser || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{visitor.page || '/'}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {visitor.first_seen ? new Date(visitor.first_seen).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No visitors tracked yet</p>
                <p className="text-sm mt-1">Visitors will appear here as they browse your site</p>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Each unique visitor is counted once per day. Page refreshes don't increase the visitor count. 
              Data auto-refreshes every 30 seconds.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
