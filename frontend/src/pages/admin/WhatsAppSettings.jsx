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
    message_template: ""
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
        setSettings(res.data);
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
      <h1 className="font-heading text-3xl font-bold mb-2">WhatsApp Notifications</h1>
      <p className="text-gray-500 mb-6">
        Get notified on WhatsApp instantly when a new order is confirmed.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>Setup required:</strong> To actually send messages, this needs an official WhatsApp
        Business Cloud API (Meta) access token and phone number ID, added as server environment
        variables (<code>WHATSAPP_ACCESS_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>).
        Until those are added, order confirmations will be tracked but no message will be sent.
      </div>

      <div className="space-y-5 bg-white border rounded-2xl p-6">
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
            Enable WhatsApp order notifications
          </Label>
        </div>

        <div>
          <Label htmlFor="wa-number">Your WhatsApp Number (with country code)</Label>
          <Input
            id="wa-number"
            placeholder="923001234567"
            value={settings.notify_number || ""}
            onChange={(e) => setSettings({ ...settings, notify_number: e.target.value })}
            className="mt-2"
            data-testid="whatsapp-number-input"
          />
        </div>

        <div>
          <Label htmlFor="wa-template">Notification Message Template</Label>
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

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full"
          data-testid="whatsapp-save-btn"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
