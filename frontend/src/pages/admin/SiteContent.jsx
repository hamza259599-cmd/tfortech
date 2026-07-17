import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { FileText, Save, RotateCcw, Upload, X, Image, Info, Phone, HelpCircle, Shield, FileCheck, Truck, Package, Sparkles, Type, Palette, CreditCard } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default content
const defaultContent = {
  // Hero Section
  hero_title: "More Than a Bag. It's Your Signature.",
  hero_subtitle: "Express your unique style with our collection of standout handbags.",
  hero_image: "",
  
  // Footer
  footer_description: "Express your unique style with our collection of standout handbags.",
  
  // Stylish Text Settings
  stylish_text: {
    enabled: false,
    intensity: "medium", // low, medium, high
    apply_to: ["hero_title"], // where to apply: hero_title, product_names, category_names
    preset: "playful" // playful, subtle, rainbow, monochrome
  },
  
  // Payment Settings (Checkout page)
  payment_settings: {
    method_title: "Cash on Delivery (COD)",
    method_description: "Free shipping on order over Rs. 2000",
    cod_available: true
  },
  
  // Popularity Badge Settings (Product cards)
  popularity_badge: {
    enabled: true,
    show_on: "related", // related, all, featured
    badge_type: "random", // random, fixed, hide
    fixed_text: "100+ bought since yesterday",
    random_options: [
      "50+ bought today",
      "100+ bought since yesterday", 
      "Best Seller",
      "Trending Now",
      "Popular Choice",
      "Hot Item 🔥",
      "Customers Love This"
    ]
  },
  
  // Service Features (Homepage badges)
  service_features: [
    { icon: "🚚", title: "Free Delivery", description: "On orders over Rs. 5000" },
    { icon: "📦", title: "Free Shipping", description: "On order over Rs. 2000" },
    { icon: "✅", title: "Quality Guarantee", description: "30-day return policy" }
  ],
  
  // Product Page Delivery Info
  delivery_info: {
    shipping_text: "Free 5000+",
    cod_text: "Available",
    returns_text: "20 Days"
  },
  
  // About Us
  about_title: "About GoJuniors",
  about_content: "Welcome to GoJuniors! We are dedicated to providing the best quality products for you and your family.",
  about_image: "",
  
  // Contact Us
  contact_email: "info@gojuniors.com",
  contact_phone: "0306 0634634",
  contact_address: "Lahore, Pakistan",
  contact_hours: "Mon-Sat: 9AM - 6PM",
  
  // FAQ
  faqs: [
    { question: "What payment methods do you accept?", answer: "We accept Cash on Delivery (COD) only." },
    { question: "How long does delivery take?", answer: "Delivery usually takes 3-5 business days." },
    { question: "Can I return a product?", answer: "Yes, you can return products within the return period mentioned on each product." }
  ],
  
  // Terms & Conditions
  terms_content: "These are the terms and conditions for using GoJuniors...",
  
  // Privacy Policy
  privacy_content: "This is the privacy policy for GoJuniors..."
};

export default function SiteContent() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/settings/content`);
      if (response.data && Object.keys(response.data).length > 0) {
        setContent({ ...defaultContent, ...response.data });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/settings/content`, content, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Content saved successfully! 🎉");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(defaultContent);
    toast.success("Content reset to default");
  };

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const response = await axios.post(`${API}/upload/image`, { image: reader.result });
        handleChange(key, `${BACKEND_URL}${response.data.image_url}`);
        toast.success("Image uploaded!");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  const handleFAQChange = (index, field, value) => {
    const newFaqs = [...(content.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    handleChange("faqs", newFaqs);
  };

  const addFAQ = () => {
    const newFaqs = [...(content.faqs || []), { question: "", answer: "" }];
    handleChange("faqs", newFaqs);
  };

  const removeFAQ = (index) => {
    const newFaqs = (content.faqs || []).filter((_, i) => i !== index);
    handleChange("faqs", newFaqs);
  };

  // Service Features handlers
  const handleServiceChange = (index, field, value) => {
    const newServices = [...(content.service_features || [])];
    newServices[index] = { ...newServices[index], [field]: value };
    handleChange("service_features", newServices);
  };

  const addService = () => {
    const newServices = [...(content.service_features || []), { icon: "⭐", title: "", description: "" }];
    handleChange("service_features", newServices);
  };

  const removeService = (index) => {
    const newServices = (content.service_features || []).filter((_, i) => i !== index);
    handleChange("service_features", newServices);
  };

  // Popular emoji options for service icons
  const popularEmojis = [
    "🚚", "📦", "✅", "🛡️", "💳", "🔒", "⭐", "💎", "🎁", "❤️",
    "🏆", "👍", "✨", "🔥", "💯", "🛒", "📞", "💬", "🎯", "⚡"
  ];

  // Stylish text presets
  const stylishPresets = [
    { id: "playful", label: "🎨 Playful", description: "Fun colorful random style" },
    { id: "subtle", label: "✨ Subtle", description: "Light elegant variation" },
    { id: "rainbow", label: "🌈 Rainbow", description: "Multi-color vibrant" },
    { id: "monochrome", label: "⚫ Monochrome", description: "Black & gray tones" }
  ];

  const stylishApplyOptions = [
    { id: "hero_title", label: "Hero Title" },
    { id: "product_names", label: "Product Names" },
    { id: "category_names", label: "Category Names" },
    { id: "section_headings", label: "Section Headings" }
  ];

  const tabs = [
    { id: "hero", label: "Hero Section", icon: Image },
    { id: "stylish", label: "Stylish Text", icon: Sparkles },
    { id: "popularity", label: "Popularity Badge", icon: Type },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "services", label: "Services", icon: Truck },
    { id: "delivery", label: "Delivery Info", icon: Package },
    { id: "about", label: "About Us", icon: Info },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "terms", label: "Terms", icon: FileCheck },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

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
              <div className="w-12 h-12 bg-[#FF8FAB] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  Site Content
                </h1>
                <p className="text-[#6B7280]">Manage all website content from here</p>
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
                className="rounded-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save All"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FF8FAB] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Hero Section Tab */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4">Hero Section</h2>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Hero Title</Label>
                  <Input
                    value={content.hero_title}
                    onChange={(e) => handleChange("hero_title", e.target.value)}
                    placeholder="Main headline..."
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Hero Subtitle</Label>
                  <Textarea
                    value={content.hero_subtitle}
                    onChange={(e) => handleChange("hero_subtitle", e.target.value)}
                    placeholder="Description text..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Hero Background Image</Label>
                  {content.hero_image ? (
                    <div className="relative">
                      <img 
                        src={content.hero_image} 
                        alt="Hero" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => handleChange("hero_image", "")}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8FAB] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("hero_image", e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FF8FAB] border-t-transparent"></div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-gray-500">Click to upload hero image</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Footer Description</Label>
                  <Textarea
                    value={content.footer_description}
                    onChange={(e) => handleChange("footer_description", e.target.value)}
                    placeholder="Footer text..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Stylish Text Tab */}
            {activeTab === "stylish" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#FFD166]" />
                    Stylish Text Settings
                  </h2>
                  <p className="text-gray-500 text-sm">Add playful random styling to text elements</p>
                </div>
                
                {/* Enable Toggle */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Type className="w-5 h-5 text-[#4ECDC4]" />
                        Enable Stylish Text
                      </h3>
                      <p className="text-sm text-gray-500">Turn on playful random styling for text</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange("stylish_text", {
                        ...content.stylish_text,
                        enabled: !content.stylish_text?.enabled
                      })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        content.stylish_text?.enabled ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                        content.stylish_text?.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  {/* Intensity */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Intensity Level</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {["low", "medium", "high"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleChange("stylish_text", {
                            ...content.stylish_text,
                            intensity: level
                          })}
                          className={`p-3 rounded-lg border-2 text-center capitalize transition-all ${
                            content.stylish_text?.intensity === level
                              ? 'border-[#FF8FAB] bg-[#FF8FAB]/10 text-[#FF8FAB]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {level === "low" && "✨ "}
                          {level === "medium" && "🎨 "}
                          {level === "high" && "🎉 "}
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Preset Style */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Style Preset
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {stylishPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleChange("stylish_text", {
                            ...content.stylish_text,
                            preset: preset.id
                          })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            content.stylish_text?.preset === preset.id
                              ? 'border-[#4ECDC4] bg-[#4ECDC4]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-gray-500">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Apply To */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Apply To</Label>
                    <div className="flex flex-wrap gap-2">
                      {stylishApplyOptions.map((option) => {
                        const isSelected = content.stylish_text?.apply_to?.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              const currentApplyTo = content.stylish_text?.apply_to || [];
                              const newApplyTo = isSelected
                                ? currentApplyTo.filter(id => id !== option.id)
                                : [...currentApplyTo, option.id];
                              handleChange("stylish_text", {
                                ...content.stylish_text,
                                apply_to: newApplyTo
                              });
                            }}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              isSelected
                                ? 'bg-[#FF8FAB] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-3 block">Preview</Label>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-2xl font-bold inline-flex flex-wrap justify-center">
                        {content.stylish_text?.enabled ? (
                          "GoJuniors".split('').map((letter, i) => {
                            const colors = {
                              playful: ["#FF8FAB", "#FFD166", "#4ECDC4", "#9B59B6", "#06D6A0"],
                              subtle: ["#FF8FAB", "#4ECDC4"],
                              rainbow: ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1", "#9B59B6"],
                              monochrome: ["#1A1A1A", "#4A4A4A", "#6B7280"]
                            };
                            const presetColors = colors[content.stylish_text?.preset] || colors.playful;
                            const intensity = content.stylish_text?.intensity || "medium";
                            const sizeRange = { low: [0.95, 1.05], medium: [0.9, 1.15], high: [0.85, 1.25] };
                            const rotateRange = { low: [-3, 3], medium: [-5, 5], high: [-8, 8] };
                            const [minS, maxS] = sizeRange[intensity];
                            const [minR, maxR] = rotateRange[intensity];
                            const size = minS + (Math.random() * (maxS - minS));
                            const rotate = minR + (Math.random() * (maxR - minR));
                            const color = presetColors[i % presetColors.length];
                            
                            return (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-block',
                                  transform: `rotate(${rotate}deg) scale(${size})`,
                                  color: color,
                                  fontWeight: Math.random() > 0.7 ? 'bold' : 'normal'
                                }}
                              >
                                {letter}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400">GoJuniors (Stylish Text Disabled)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-3">This is how your text will look</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#4ECDC4]" />
                    Payment Settings
                  </h2>
                  <p className="text-gray-500 text-sm">Configure payment method text shown on checkout page</p>
                </div>
                
                <div className="bg-white rounded-xl border p-6 space-y-6">
                  {/* Payment Method Title */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Payment Method Title</Label>
                    <Input
                      value={content.payment_settings?.method_title || "Cash on Delivery (COD)"}
                      onChange={(e) => handleChange("payment_settings", {
                        ...content.payment_settings,
                        method_title: e.target.value
                      })}
                      placeholder="Cash on Delivery (COD)"
                    />
                    <p className="text-xs text-gray-400 mt-1">Main title shown for payment method</p>
                  </div>
                  
                  {/* Payment Method Description */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Payment Method Description</Label>
                    <Input
                      value={content.payment_settings?.method_description || "Free shipping on order over Rs. 2000"}
                      onChange={(e) => handleChange("payment_settings", {
                        ...content.payment_settings,
                        method_description: e.target.value
                      })}
                      placeholder="Free shipping on order over Rs. 2000"
                    />
                    <p className="text-xs text-gray-400 mt-1">Description text shown below payment method</p>
                  </div>
                  
                  {/* COD Available Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">COD Available</Label>
                      <p className="text-xs text-gray-400">Enable or disable Cash on Delivery option</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange("payment_settings", {
                        ...content.payment_settings,
                        cod_available: !content.payment_settings?.cod_available
                      })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        content.payment_settings?.cod_available !== false ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                        content.payment_settings?.cod_available !== false ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  {/* Preview */}
                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-3 block">Preview (Checkout Page)</Label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-[#1A1A1A] mb-3">Payment Method</h3>
                      <div className="bg-white border-2 border-[#4ECDC4] rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-[#4ECDC4] flex items-center justify-center">
                            <div className="w-3 h-3 bg-[#4ECDC4] rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1A1A]">
                              {content.payment_settings?.method_title || "Cash on Delivery (COD)"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {content.payment_settings?.method_description || "Free shipping on order over Rs. 2000"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Popularity Badge Tab */}
            {activeTab === "popularity" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Type className="w-6 h-6 text-[#FF8FAB]" />
                    Popularity Badge Settings
                  </h2>
                  <p className="text-gray-500 text-sm">Configure the "100+ bought" style badges on product cards</p>
                </div>
                
                <div className="bg-white rounded-xl border p-6 space-y-6">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Enable Popularity Badge</Label>
                      <p className="text-xs text-gray-400">Show popularity badges on product cards</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange("popularity_badge", {
                        ...content.popularity_badge,
                        enabled: !content.popularity_badge?.enabled
                      })}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        content.popularity_badge?.enabled !== false ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                        content.popularity_badge?.enabled !== false ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Badge Type Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Badge Type</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "random", label: "Random", desc: "Show random text from list" },
                        { value: "fixed", label: "Fixed", desc: "Show same text always" },
                        { value: "hide", label: "Hidden", desc: "Don't show badge" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange("popularity_badge", {
                            ...content.popularity_badge,
                            badge_type: option.value
                          })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            content.popularity_badge?.badge_type === option.value
                              ? 'border-[#FF8FAB] bg-[#FF8FAB]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium text-[#1A1A1A]">{option.label}</span>
                          <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fixed Text Input */}
                  {content.popularity_badge?.badge_type === "fixed" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Fixed Badge Text</Label>
                      <Input
                        value={content.popularity_badge?.fixed_text || "100+ bought since yesterday"}
                        onChange={(e) => handleChange("popularity_badge", {
                          ...content.popularity_badge,
                          fixed_text: e.target.value
                        })}
                        placeholder="100+ bought since yesterday"
                      />
                    </div>
                  )}

                  {/* Random Options */}
                  {content.popularity_badge?.badge_type === "random" && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Random Badge Options</Label>
                      <p className="text-xs text-gray-400 mb-3">One of these will be randomly shown on each product</p>
                      
                      <div className="space-y-2">
                        {(content.popularity_badge?.random_options || [
                          "50+ bought today",
                          "100+ bought since yesterday",
                          "Best Seller",
                          "Trending Now",
                          "Popular Choice",
                          "Hot Item 🔥",
                          "Customers Love This"
                        ]).map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(content.popularity_badge?.random_options || [])];
                                newOptions[index] = e.target.value;
                                handleChange("popularity_badge", {
                                  ...content.popularity_badge,
                                  random_options: newOptions
                                });
                              }}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...(content.popularity_badge?.random_options || [])];
                                newOptions.splice(index, 1);
                                handleChange("popularity_badge", {
                                  ...content.popularity_badge,
                                  random_options: newOptions
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newOptions = [...(content.popularity_badge?.random_options || []), "New Badge Text"];
                            handleChange("popularity_badge", {
                              ...content.popularity_badge,
                              random_options: newOptions
                            });
                          }}
                          className="w-full mt-2"
                        >
                          + Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-3 block">Preview</Label>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <div className="bg-[#FF8FAB] text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {content.popularity_badge?.badge_type === "hide" 
                          ? "(Badge Hidden)" 
                          : content.popularity_badge?.badge_type === "fixed"
                            ? content.popularity_badge?.fixed_text || "100+ bought since yesterday"
                            : content.popularity_badge?.random_options?.[0] || "50+ bought today"
                        }
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      {content.popularity_badge?.badge_type === "random" 
                        ? "Random option will be shown on each product" 
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">Service Features</h2>
                    <p className="text-gray-500 text-sm">These badges appear on homepage below hero section</p>
                  </div>
                  <Button onClick={addService} className="rounded-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                    + Add Service
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(content.service_features || []).map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 relative bg-gray-50">
                      <button
                        onClick={() => removeService(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Icon (Emoji)</Label>
                          <Input
                            value={service.icon}
                            onChange={(e) => handleServiceChange(index, "icon", e.target.value)}
                            placeholder="🚚"
                            className="w-full text-2xl text-center mb-2"
                          />
                          {/* Quick Emoji Picker */}
                          <div className="flex flex-wrap gap-1">
                            {popularEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleServiceChange(index, "icon", emoji)}
                                className={`w-8 h-8 text-lg rounded hover:bg-gray-200 transition-colors ${service.icon === emoji ? 'bg-[#FF8FAB]/20 ring-2 ring-[#FF8FAB]' : 'bg-gray-100'}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Title</Label>
                          <Input
                            value={service.title}
                            onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                            placeholder="Free Delivery"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Description</Label>
                          <Input
                            value={service.description}
                            onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                            placeholder="On orders over Rs. 5000"
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      {/* Preview */}
                      <div className="mt-3 p-3 bg-white rounded-lg border flex items-center gap-3">
                        <span className="text-3xl">{service.icon}</span>
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{service.title || "Title"}</p>
                          <p className="text-sm text-gray-500">{service.description || "Description"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(content.service_features || []).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No service features yet. Click "Add Service" to create one.</p>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Info Tab */}
            {activeTab === "delivery" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-2">Delivery Information</h2>
                  <p className="text-gray-500 text-sm mb-6">This appears on product pages under "How you will get this item"</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Shipping */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🚚</span>
                      <Label className="text-sm font-bold">Shipping</Label>
                    </div>
                    <Input
                      value={content.delivery_info?.shipping_text || "Free 5000+"}
                      onChange={(e) => handleChange("delivery_info", {
                        ...content.delivery_info,
                        shipping_text: e.target.value
                      })}
                      placeholder="Free 5000+"
                      className="w-full"
                    />
                  </div>

                  {/* COD */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">💵</span>
                      <Label className="text-sm font-bold">COD (Cash on Delivery)</Label>
                    </div>
                    <Input
                      value={content.delivery_info?.cod_text || "Available"}
                      onChange={(e) => handleChange("delivery_info", {
                        ...content.delivery_info,
                        cod_text: e.target.value
                      })}
                      placeholder="Available"
                      className="w-full"
                    />
                  </div>

                  {/* Returns */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">↩️</span>
                      <Label className="text-sm font-bold">Returns</Label>
                    </div>
                    <Input
                      value={content.delivery_info?.returns_text || "20 Days"}
                      onChange={(e) => handleChange("delivery_info", {
                        ...content.delivery_info,
                        returns_text: e.target.value
                      })}
                      placeholder="20 Days"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <Label className="text-sm font-bold mb-3 block">Preview (How it looks on Product Page)</Label>
                  <div className="bg-white border rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">How you will get this item</h4>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-center flex-1">
                        <p className="text-gray-500 text-sm">Shipping</p>
                        <p className="font-semibold text-[#1A1A1A]">{content.delivery_info?.shipping_text || "Free 5000+"}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200"></div>
                      <div className="text-center flex-1">
                        <p className="text-gray-500 text-sm">COD</p>
                        <p className="font-semibold text-[#1A1A1A]">{content.delivery_info?.cod_text || "Available"}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200"></div>
                      <div className="text-center flex-1">
                        <p className="text-gray-500 text-sm">Returns</p>
                        <p className="font-semibold text-[#1A1A1A]">{content.delivery_info?.returns_text || "20 Days"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About Us Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4">About Us Page</h2>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Page Title</Label>
                  <Input
                    value={content.about_title}
                    onChange={(e) => handleChange("about_title", e.target.value)}
                    placeholder="About Us title..."
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">About Content</Label>
                  <Textarea
                    value={content.about_content}
                    onChange={(e) => handleChange("about_content", e.target.value)}
                    placeholder="Write about your company..."
                    rows={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">About Us Image</Label>
                  {content.about_image ? (
                    <div className="relative">
                      <img 
                        src={content.about_image} 
                        alt="About" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => handleChange("about_image", "")}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF8FAB] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("about_image", e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FF8FAB] border-t-transparent"></div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-gray-500">Click to upload about image</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Email</Label>
                    <Input
                      value={content.contact_email}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      placeholder="info@example.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Phone</Label>
                    <Input
                      value={content.contact_phone}
                      onChange={(e) => handleChange("contact_phone", e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Address</Label>
                    <Input
                      value={content.contact_address}
                      onChange={(e) => handleChange("contact_address", e.target.value)}
                      placeholder="City, Country"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Working Hours</Label>
                    <Input
                      value={content.contact_hours}
                      onChange={(e) => handleChange("contact_hours", e.target.value)}
                      placeholder="Mon-Sat: 9AM - 6PM"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === "faq" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
                  <Button onClick={addFAQ} className="rounded-full bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                    + Add FAQ
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(content.faqs || []).map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 relative">
                      <button
                        onClick={() => removeFAQ(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Question {index + 1}</Label>
                          <Input
                            value={faq.question}
                            onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                            placeholder="Enter question..."
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Answer</Label>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
                            placeholder="Enter answer..."
                            rows={2}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms Tab */}
            {activeTab === "terms" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4">Terms & Conditions</h2>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Terms Content</Label>
                  <Textarea
                    value={content.terms_content}
                    onChange={(e) => handleChange("terms_content", e.target.value)}
                    placeholder="Write your terms and conditions..."
                    rows={15}
                    className="w-full font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tip: Use line breaks for paragraphs</p>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-bold text-[#1A1A1A] mb-4">Privacy Policy</h2>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Privacy Policy Content</Label>
                  <Textarea
                    value={content.privacy_content}
                    onChange={(e) => handleChange("privacy_content", e.target.value)}
                    placeholder="Write your privacy policy..."
                    rows={15}
                    className="w-full font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tip: Use line breaks for paragraphs</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
