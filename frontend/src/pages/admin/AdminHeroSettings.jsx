import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Monitor, Tablet, Smartphone, RotateCcw, Image as ImageIcon } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import HeroImageLayer from "../../components/HeroImageLayer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DEFAULT_SETTINGS = {
  image: {
    url: "",
    fit_mode: "cover",
    desktop: { scale: 1, x: 50, y: 50, width: 100, height: 100 },
    tablet: { scale: 1, x: 50, y: 50, width: 100, height: 100 },
    mobile: { scale: 1, x: 50, y: 50, width: 100, height: 100 },
  },
  watermark: {
    url: "",
    opacity: 0.5,
    desktop: { scale: 1, x: 90, y: 90 },
    tablet: { scale: 1, x: 90, y: 90 },
    mobile: { scale: 1, x: 90, y: 90 },
  },
};

const BREAKPOINTS = [
  { key: "desktop", label: "Desktop", icon: Monitor },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "mobile", label: "Mobile", icon: Smartphone },
];

function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "" }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500 tabular-nums">{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#FF8FAB]"
      />
    </div>
  );
}

export default function AdminHeroSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewBp, setPreviewBp] = useState("desktop");
  const [activeTab, setActiveTab] = useState("image"); // image | watermark

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings/hero`);
      setSettings({
        image: { ...DEFAULT_SETTINGS.image, ...res.data.image },
        watermark: { ...DEFAULT_SETTINGS.watermark, ...res.data.watermark },
      });
    } catch (e) {
      toast.error("Failed to load hero settings");
    } finally {
      setLoading(false);
    }
  };

  const updateImageField = (bp, field, value) => {
    setSettings((s) => ({ ...s, image: { ...s.image, [bp]: { ...s.image[bp], [field]: value } } }));
  };
  const updateWatermarkField = (bp, field, value) => {
    setSettings((s) => ({ ...s, watermark: { ...s.watermark, [bp]: { ...s.watermark[bp], [field]: value } } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/admin/settings/hero`, settings);
      toast.success("Hero section settings saved \u2014 live on the site now");
    } catch (e) {
      toast.error("Failed to save hero settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Reset the hero image and watermark to default position and size?")) return;
    setSettings(DEFAULT_SETTINGS);
    toast.success("Reset \u2014 click Save to apply");
  };

  const imgBp = settings.image[previewBp];
  const wmBp = settings.watermark[previewBp];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-gray-500">Loading hero settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hero Section</h1>
              <p className="text-sm text-gray-500">Adjust the homepage banner image and watermark - freely, per device</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#FF8FAB] text-white px-5 py-2 rounded-xl font-medium hover:bg-[#FF8FAB]/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 space-y-6">
          {/* Live Preview */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Live Preview</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {BREAKPOINTS.map((bp) => (
                  <button
                    key={bp.key}
                    onClick={() => setPreviewBp(bp.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      previewBp === bp.key ? "bg-white shadow-sm text-[#1A1A1A]" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <bp.icon className="w-3.5 h-3.5" />
                    {bp.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`relative overflow-hidden rounded-lg bg-gray-900 mx-auto transition-all ${
                previewBp === "mobile" ? "max-w-[375px] aspect-[9/16]" : previewBp === "tablet" ? "max-w-[640px] aspect-[4/3]" : "w-full aspect-[16/7]"
              }`}
            >
              <HeroImageLayer settings={settings} breakpoint={previewBp} alt="Preview" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center px-6">
                <div className="text-white">
                  <span className="inline-block bg-white/20 text-xs px-2 py-1 rounded-full mb-2">New Arrivals!</span>
                  <p className="font-bold text-lg md:text-2xl">Hero Title Preview</p>
                </div>
              </div>
              {!settings.image.url && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm gap-2 pointer-events-none">
                  <ImageIcon className="w-4 h-4" /> No image set - paste a URL below
                </div>
              )}
            </div>
          </div>

          {/* Tabs: Image / Watermark */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("image")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "image" ? "bg-[#1A1A1A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Hero Image
            </button>
            <button
              onClick={() => setActiveTab("watermark")}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === "watermark" ? "bg-[#1A1A1A] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Watermark
            </button>
          </div>

          {activeTab === "image" ? (
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={settings.image.url || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, image: { ...s.image, url: e.target.value } }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fit Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {["cover", "contain", "custom"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSettings((s) => ({ ...s, image: { ...s.image, fit_mode: mode } }))}
                      className={`px-4 py-2.5 rounded-xl font-medium capitalize transition-colors border ${
                        settings.image.fit_mode === mode
                          ? "bg-[#FF8FAB]/10 border-[#FF8FAB] text-[#FF8FAB]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Cover fills the section (may crop). Contain shows the full image. Custom gives you exact width/height/position control.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
                  {BREAKPOINTS.map((bp) => (
                    <button
                      key={bp.key}
                      onClick={() => setPreviewBp(bp.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        previewBp === bp.key ? "bg-white shadow-sm text-[#1A1A1A]" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <bp.icon className="w-3.5 h-3.5" />
                      {bp.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Slider label="Scale" value={imgBp.scale} min={0.2} max={3} step={0.05} suffix="x"
                    onChange={(v) => updateImageField(previewBp, "scale", v)} />
                  <div />
                  <Slider label="Horizontal Position (X)" value={imgBp.x} suffix="%"
                    onChange={(v) => updateImageField(previewBp, "x", v)} />
                  <Slider label="Vertical Position (Y)" value={imgBp.y} suffix="%"
                    onChange={(v) => updateImageField(previewBp, "y", v)} />
                  {settings.image.fit_mode === "custom" && (
                    <>
                      <Slider label="Width" value={imgBp.width} min={10} max={200} suffix="%"
                        onChange={(v) => updateImageField(previewBp, "width", v)} />
                      <Slider label="Height" value={imgBp.height} min={10} max={200} suffix="%"
                        onChange={(v) => updateImageField(previewBp, "height", v)} />
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  These settings apply only to the <strong className="capitalize">{previewBp}</strong> view. Switch tabs above to adjust other screen sizes separately.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Image URL</label>
                <input
                  type="text"
                  value={settings.watermark.url || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, watermark: { ...s.watermark, url: e.target.value } }))}
                  placeholder="https://... (leave empty to hide watermark)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8FAB]/50 focus:border-[#FF8FAB] outline-none"
                />
              </div>

              <Slider label="Opacity" value={settings.watermark.opacity} min={0} max={1} step={0.05}
                onChange={(v) => setSettings((s) => ({ ...s, watermark: { ...s.watermark, opacity: v } }))} />

              <div className="border-t border-gray-100 pt-5">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
                  {BREAKPOINTS.map((bp) => (
                    <button
                      key={bp.key}
                      onClick={() => setPreviewBp(bp.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        previewBp === bp.key ? "bg-white shadow-sm text-[#1A1A1A]" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <bp.icon className="w-3.5 h-3.5" />
                      {bp.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Slider label="Scale" value={wmBp.scale} min={0.2} max={3} step={0.05} suffix="x"
                    onChange={(v) => updateWatermarkField(previewBp, "scale", v)} />
                  <div />
                  <Slider label="Horizontal Position (X)" value={wmBp.x} suffix="%"
                    onChange={(v) => updateWatermarkField(previewBp, "x", v)} />
                  <Slider label="Vertical Position (Y)" value={wmBp.y} suffix="%"
                    onChange={(v) => updateWatermarkField(previewBp, "y", v)} />
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  These settings apply only to the <strong className="capitalize">{previewBp}</strong> view.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
