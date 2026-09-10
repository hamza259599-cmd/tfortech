import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WhatsAppSettings() {
  const [settings, setSettings] = useState({
    enabled: false,
    notify_number: "",
    message_template: "",
    ordering_enabled: true,
    show_on_product_page: true,
    show_floating_button: true,
    order_message_template: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/admin/settings/whatsapp`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings((prev) => ({ ...prev, ...res.data }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/settings/whatsapp`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("WhatsApp settings saved");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold mb-2">WhatsApp Settings</h1>
      <p className="text-gray-500 mb-6">
        Control the WhatsApp number, order button, and admin order alerts.
      </p>

      <div className="bg-white border rounded-2xl p-6 mb-6 space-y-5">
        <h2 className="font-heading font-bold text-lg">WhatsApp Number</h2>
        <div>
          <Label htmlFor="wa-number">Your WhatsApp Number (with country code, no + or spaces)</Label>
          <Input
            id="wa-number"
            placeholder="923001234567"
            value={settings.notify_number || ""}
            onChange={(e) => setSettings({ ...settings, notify_number: e.target.value })}
            className="mt-2"
            data-testid="whatsapp-number-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used both for customer "Order on WhatsApp" clicks and your own order alerts.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 mb-6 space-y-5">
        <h2 className="font-heading font-bold text-lg">Customer "Order on WhatsApp" Button</h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="wa-ordering-enabled"
            checked={settings.ordering_enabled}
            onChange={(e) => setSettings({ ...settings, ordering_enabled: e.target.checked })}
            className="w-5 h-5"
            data-testid="whatsapp-ordering-enabled-checkbox"
          />
          <Label htmlFor="wa-ordering-enabled" className="cursor-pointer">
            Enable WhatsApp ordering on the storefront
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="wa-show-product"
            checked={settings.show_on_product_page}
            onChange={(e) => setSettings({ ...settings, show_on_product_page: e.target.checked })}
            className="w-5 h-5"
            data-testid="whatsapp-show-product-checkbox"
          />
          <Label htmlFor="wa-show-product" className="cursor-pointer">
            Show "Order on WhatsApp" button on product pages
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="wa-show-floating"
            checked={settings.show_floating_button}
            onChange={(e) => setSettings({ ...settings, show_floating_button: e.target.checked })}
            className="w-5 h-5"
            data-testid="whatsapp-show-floating-checkbox"
          />
          <Label htmlFor="wa-show-floating" className="cursor-pointer">
            Show floating WhatsApp button site-wide
          </Label>
        </div>

        <div>
          <Label htmlFor="wa-order-template">Order Message Template (sent by customer)</Label>
          <Textarea
            id="wa-order-template"
            rows={6}
            value={settings.order_message_template || ""}
            onChange={(e) => setSettings({ ...settings, order_message_template: e.target.value })}
            className="mt-2 font-mono text-sm"
            data-testid="whatsapp-order-template-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Placeholders: {"{{product_name}} {{price}} {{quantity}} {{product_url}} {{sku}} {{category}} {{description}}"}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 mb-6 space-y-5">
        <h2 className="font-heading font-bold text-lg">Admin Order Alerts</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Setup required:</strong> To actually send you an alert message, this needs an official
          WhatsApp Business Cloud API (Meta) access token and phone number ID, added as server environment
          variables (<code>WHATSAPP_ACCESS_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>). Until those
          are added, confirmed orders are tracked but no alert message will be sent.
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="wa-enabled"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="w-5 h-5"
            data-testid="whatsapp-enabled-checkbox"
          />
          <Label htmlFor="wa-enabled" className="cursor-pointer">
            Enable WhatsApp alert when an order is confirmed
          </Label>
        </div>

        <div>
          <Label htmlFor="wa-template">Admin Alert Message Template</Label>
          <Textarea
            id="wa-template"
            rows={8}
            value={settings.message_template || ""}
            onChange={(e) => setSettings({ ...settings, message_template: e.target.value })}
            className="mt-2 font-mono text-sm"
            data-testid="whatsapp-template-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Placeholders: {"{order_id} {customer_name} {phone} {products} {total} {payment_method} {address}"}
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full"
        data-testid="whatsapp-save-btn"
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
