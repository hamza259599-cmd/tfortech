import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { Palette, Save, RotateCcw, Eye, Upload, X, Image } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default theme colors
const defaultTheme = {
  primary_color: "#3B82F6",
  secondary_color: "#FFD166",
  accent_color: "#06D6A0",
  text_color: "#1A1A1A",
  background_color: "#FDFBF7",
  button_text_color: "#FFFFFF",
  watermark_text: "",
  watermark_image: "",
  watermark_opacity: 0.1,
  watermark_position: "center"
};

// Preset themes
const presetThemes = [
  { name: "Pink (Default)", primary: "#3B82F6", secondary: "#FFD166", accent: "#06D6A0" },
  { name: "Blue Ocean", primary: "#3B82F6", secondary: "#60A5FA", accent: "#10B981" },
  { name: "Purple Dreams", primary: "#8B5CF6", secondary: "#A78BFA", accent: "#EC4899" },
  { name: "Green Nature", primary: "#10B981", secondary: "#34D399", accent: "#F59E0B" },
  { name: "Orange Sunset", primary: "#F97316", secondary: "#FB923C", accent: "#EF4444" },
  { name: "Red Passion", primary: "#EF4444", secondary: "#F87171", accent: "#F59E0B" },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await axios.get(`${API}/settings/theme`);
      if (response.data && Object.keys(response.data).length > 0) {
        setTheme({ ...defaultTheme, ...response.data });
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/settings/theme`, theme, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Apply theme to CSS variables
      applyTheme(theme);
      
      toast.success("Theme saved successfully! 🎨");
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
    toast.success("Theme reset to default");
  };

  const applyPreset = (preset) => {
    const newTheme = {
      ...theme,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    };
    setTheme(newTheme);
    applyTheme(newTheme);
    toast.success(`Applied "${preset.name}" theme`);
  };

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeData.primary_color);
    root.style.setProperty('--color-secondary', themeData.secondary_color);
    root.style.setProperty('--color-accent', themeData.accent_color);
    root.style.setProperty('--color-text', themeData.text_color);
    root.style.setProperty('--color-background', themeData.background_color);
    root.style.setProperty('--color-button-text', themeData.button_text_color);
    
    // Also update body background
    document.body.style.backgroundColor = themeData.background_color;
  };

  const handleColorChange = (key, value) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    // Live preview
    applyTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primary_color }}>
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  Theme Colors
                </h1>
                <p className="text-[#6B7280]">Customize your website appearance</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="rounded-full text-white"
                style={{ backgroundColor: theme.primary_color }}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Theme"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Color Pickers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Colors */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] mb-6">Main Colors</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Color */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Primary Color (Buttons, Links)
                    </Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: theme.primary_color }}
                      >
                        <input 
                          type="color"
                          value={theme.primary_color}
                          onChange={(e) => handleColorChange('primary_color', e.target.value)}
                          className="w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={theme.primary_color}
                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                        className="w-32 uppercase"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Secondary Color (Badges, Highlights)
                    </Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: theme.secondary_color }}
                      >
                        <input 
                          type="color"
                          value={theme.secondary_color}
                          onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                          className="w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={theme.secondary_color}
                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                        className="w-32 uppercase"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Accent Color (Success, Stock)
                    </Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: theme.accent_color }}
                      >
                        <input 
                          type="color"
                          value={theme.accent_color}
                          onChange={(e) => handleColorChange('accent_color', e.target.value)}
                          className="w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={theme.accent_color}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        className="w-32 uppercase"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Text Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: theme.text_color }}
                      >
                        <input 
                          type="color"
                          value={theme.text_color}
                          onChange={(e) => handleColorChange('text_color', e.target.value)}
                          className="w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={theme.text_color}
                        onChange={(e) => handleColorChange('text_color', e.target.value)}
                        className="w-32 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Themes */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] mb-6">Preset Themes</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-left"
                    >
                      <div className="flex gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.secondary }}></div>
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: preset.accent }}></div>
                      </div>
                      <p className="font-medium text-sm text-[#1A1A1A]">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Settings */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Image className="w-5 h-5" style={{ color: theme.primary_color }} />
                  <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">Watermark Settings</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Watermark Text */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Watermark Text
                    </Label>
                    <Input 
                      value={theme.watermark_text || ""}
                      onChange={(e) => handleColorChange('watermark_text', e.target.value)}
                      placeholder="e.g., T For Tech"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Text that appears as watermark on your site</p>
                  </div>

                  {/* Watermark Image */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Watermark / Background Image
                    </Label>
                    {theme.watermark_image ? (
                      <div className="relative">
                        <img 
                          src={theme.watermark_image} 
                          alt="Watermark" 
                          className="w-full h-32 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          onClick={() => handleColorChange('watermark_image', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Image size should be less than 5MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = async () => {
                              try {
                                const response = await axios.post(`${API}/upload/image`, { image: reader.result });
                                handleColorChange('watermark_image', `${BACKEND_URL}${response.data.image_url}`);
                                toast.success("Image uploaded!");
                              } catch (error) {
                                toast.error("Failed to upload image");
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-500 text-sm">Click to upload watermark image</span>
                      </label>
                    )}
                  </div>

                  {/* Watermark Opacity */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Watermark Opacity: {Math.round((theme.watermark_opacity || 0.1) * 100)}%
                    </Label>
                    <input 
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={theme.watermark_opacity || 0.1}
                      onChange={(e) => handleColorChange('watermark_opacity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Light (5%)</span>
                      <span>Dark (50%)</span>
                    </div>
                  </div>

                  {/* Watermark Position */}
                  <div>
                    <Label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
                      Watermark Position
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "top-left", label: "↖" },
                        { value: "top-center", label: "↑" },
                        { value: "top-right", label: "↗" },
                        { value: "center-left", label: "←" },
                        { value: "center", label: "●" },
                        { value: "center-right", label: "→" },
                        { value: "bottom-left", label: "↙" },
                        { value: "bottom-center", label: "↓" },
                        { value: "bottom-right", label: "↘" },
                      ].map((pos) => (
                        <button
                          key={pos.value}
                          onClick={() => handleColorChange('watermark_position', pos.value)}
                          className={`p-3 rounded-lg border-2 text-lg transition-all ${
                            theme.watermark_position === pos.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={theme.watermark_position === pos.value ? { borderColor: theme.primary_color } : {}}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5" style={{ color: theme.primary_color }} />
                  <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">Live Preview</h2>
                </div>

                {/* Preview Card */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header Preview */}
                  <div className="p-4 border-b" style={{ backgroundColor: theme.background_color }}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: theme.text_color }}>T For Tech</span>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary_color }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="p-4 space-y-4" style={{ backgroundColor: theme.background_color }}>
                    {/* Product Card Preview */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="w-full h-20 bg-gray-100 rounded-lg mb-3"></div>
                      <p className="font-medium text-sm mb-2" style={{ color: theme.text_color }}>Sample Product</p>
                      <p className="font-bold" style={{ color: theme.primary_color }}>Rs. 2,500</p>
                    </div>

                    {/* Button Preview */}
                    <button 
                      className="w-full py-3 rounded-lg text-white font-medium"
                      style={{ backgroundColor: theme.primary_color }}
                    >
                      Add to Cart
                    </button>

                    {/* Badge Preview */}
                    <div className="flex gap-2">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${theme.secondary_color}30`, color: theme.text_color }}
                      >
                        Category
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: theme.accent_color }}
                      >
                        In Stock
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Changes are previewed live. Click Save to apply.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
