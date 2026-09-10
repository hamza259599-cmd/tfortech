import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Truck, Save } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminShipping() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    shipping_fee: 200,
    free_shipping_minimum: 5000
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/admin/shipping`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings({
          shipping_fee: response.data.shipping_fee || 200,
          free_shipping_minimum: response.data.free_shipping_minimum || 5000
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/shipping`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Shipping settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-8">
            Shipping Settings
          </h1>

          {loading ? (
            <div className="bg-white rounded-2xl p-6 animate-pulse max-w-xl">
              <div className="h-8 bg-gray-100 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-gray-100 rounded mb-4"></div>
              <div className="h-12 bg-gray-100 rounded mb-4"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl">
              <div className="bg-white rounded-2xl p-6 mb-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-[#1A1A1A]">
                      Delivery Charges
                    </h2>
                    <p className="text-sm text-gray-500">Set shipping fee for orders</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="shipping_fee" className="text-base font-medium">
                    Shipping Fee (Rs.)
                  </Label>
                  <Input
                    id="shipping_fee"
                    type="number"
                    value={settings.shipping_fee}
                    onChange={(e) => setSettings({...settings, shipping_fee: parseFloat(e.target.value) || 0})}
                    className="mt-2 text-lg h-12"
                    placeholder="200"
                    data-testid="shipping-fee-input"
                  />
                  <p className="text-sm text-[#6B7280] mt-2">
                    This amount will be added to all orders
                  </p>
                </div>

                <div>
                  <Label htmlFor="free_shipping_minimum" className="text-base font-medium">
                    Free Shipping (Orders above Rs.)
                  </Label>
                  <Input
                    id="free_shipping_minimum"
                    type="number"
                    value={settings.free_shipping_minimum}
                    onChange={(e) => setSettings({...settings, free_shipping_minimum: parseFloat(e.target.value) || 0})}
                    className="mt-2 text-lg h-12"
                    placeholder="5000"
                    data-testid="free-shipping-input"
                  />
                  <p className="text-sm text-[#6B7280] mt-2">
                    Orders above this amount get FREE delivery (set 0 to disable)
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#FFD166]">
                  <h3 className="font-medium text-[#B8860B] mb-2">📦 Preview</h3>
                  <ul className="text-sm text-[#8B6914] space-y-1">
                    <li>• Orders below Rs. {settings.free_shipping_minimum}: <strong>Rs. {settings.shipping_fee}</strong> shipping</li>
                    <li>• Orders above Rs. {settings.free_shipping_minimum}: <strong className="text-green-600">FREE</strong> shipping</li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full px-8 h-12"
                data-testid="save-shipping-btn"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Settings
                  </span>
                )}
              </Button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
