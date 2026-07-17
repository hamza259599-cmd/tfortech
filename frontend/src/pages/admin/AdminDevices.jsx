import { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  Smartphone, 
  Laptop, 
  Plus, 
  Trash2, 
  Save,
  Palette,
  Cpu,
  HardDrive,
  RefreshCw,
  X,
  FileText,
  Tag,
  Shield
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDevices() {
  const [activeTab, setActiveTab] = useState("mobile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Mobile Config
  const [mobileConfig, setMobileConfig] = useState({
    brands: [],
    colors: [],
    ram_options: [],
    storage_options: [],
    processors: [],
    descriptions: [],
    conditions: [],
    warranties: []
  });
  
  // Laptop Config
  const [laptopConfig, setLaptopConfig] = useState({
    brands: [],
    colors: [],
    ram_options: [],
    storage_options: [],
    processors: [],
    descriptions: [],
    conditions: [],
    warranties: []
  });

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [mobileRes, laptopRes] = await Promise.all([
        axios.get(`${API}/admin/device-config/mobile`, { headers }),
        axios.get(`${API}/admin/device-config/laptop`, { headers })
      ]);
      
      setMobileConfig({
        brands: mobileRes.data.brands || [],
        colors: mobileRes.data.colors || [],
        ram_options: mobileRes.data.ram_options || [],
        storage_options: mobileRes.data.storage_options || [],
        processors: mobileRes.data.processors || [],
        descriptions: mobileRes.data.descriptions || [],
        conditions: mobileRes.data.conditions || [],
        warranties: mobileRes.data.warranties || []
      });
      
      setLaptopConfig({
        brands: laptopRes.data.brands || [],
        colors: laptopRes.data.colors || [],
        ram_options: laptopRes.data.ram_options || [],
        storage_options: laptopRes.data.storage_options || [],
        processors: laptopRes.data.processors || [],
        descriptions: laptopRes.data.descriptions || [],
        conditions: laptopRes.data.conditions || [],
        warranties: laptopRes.data.warranties || []
      });
    } catch (error) {
      console.error("Error fetching configs:", error);
      toast.error("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const saveConfig = async (deviceType) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const config = deviceType === "mobile" ? mobileConfig : laptopConfig;
      
      await axios.post(`${API}/admin/device-config/${deviceType}`, {
        device_type: deviceType,
        ...config
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`${deviceType === "mobile" ? "Mobile" : "Laptop"} configuration saved!`);
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const currentConfig = activeTab === "mobile" ? mobileConfig : laptopConfig;
  const setCurrentConfig = activeTab === "mobile" ? setMobileConfig : setLaptopConfig;

  // Add brand
  const addBrand = () => {
    setCurrentConfig(prev => ({
      ...prev,
      brands: [...prev.brands, { name: "", logo: "" }]
    }));
  };

  // Update brand
  const updateBrand = (index, field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      brands: prev.brands.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }));
  };

  // Remove brand
  const removeBrand = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  // Add color
  const addColor = () => {
    setCurrentConfig(prev => ({
      ...prev,
      colors: [...prev.colors, { name: "", code: "#000000" }]
    }));
  };

  // Update color
  const updateColor = (index, field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  // Remove color
  const removeColor = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Add RAM option
  const addRamOption = () => {
    setCurrentConfig(prev => ({
      ...prev,
      ram_options: [...prev.ram_options, ""]
    }));
  };

  // Update RAM option
  const updateRamOption = (index, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      ram_options: prev.ram_options.map((r, i) => i === index ? value : r)
    }));
  };

  // Remove RAM option
  const removeRamOption = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      ram_options: prev.ram_options.filter((_, i) => i !== index)
    }));
  };

  // Add Storage option
  const addStorageOption = () => {
    setCurrentConfig(prev => ({
      ...prev,
      storage_options: [...prev.storage_options, ""]
    }));
  };

  // Update Storage option
  const updateStorageOption = (index, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      storage_options: prev.storage_options.map((s, i) => i === index ? value : s)
    }));
  };

  // Remove Storage option
  const removeStorageOption = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      storage_options: prev.storage_options.filter((_, i) => i !== index)
    }));
  };

  // Add Processor
  const addProcessor = () => {
    setCurrentConfig(prev => ({
      ...prev,
      processors: [...prev.processors, ""]
    }));
  };

  // Update Processor
  const updateProcessor = (index, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      processors: prev.processors.map((p, i) => i === index ? value : p)
    }));
  };

  // Remove Processor
  const removeProcessor = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      processors: prev.processors.filter((_, i) => i !== index)
    }));
  };

  // Add Description
  const addDescription = () => {
    setCurrentConfig(prev => ({
      ...prev,
      descriptions: [...prev.descriptions, { title: "", text: "" }]
    }));
  };

  // Update Description
  const updateDescription = (index, field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      descriptions: prev.descriptions.map((d, i) => i === index ? { ...d, [field]: value } : d)
    }));
  };

  // Remove Description
  const removeDescription = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index)
    }));
  };

  // Add Condition
  const addCondition = () => {
    setCurrentConfig(prev => ({
      ...prev,
      conditions: [...prev.conditions, { name: "", badge_color: "#4CAF50", badge_text_color: "#FFFFFF" }]
    }));
  };

  // Update Condition
  const updateCondition = (index, field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  // Remove Condition
  const removeCondition = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  // Add Warranty
  const addWarranty = () => {
    setCurrentConfig(prev => ({
      ...prev,
      warranties: [...prev.warranties, { duration: "", description: "" }]
    }));
  };

  // Update Warranty
  const updateWarranty = (index, field, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      warranties: prev.warranties.map((w, i) => i === index ? { ...w, [field]: value } : w)
    }));
  };

  // Remove Warranty
  const removeWarranty = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      warranties: prev.warranties.filter((_, i) => i !== index)
    }));
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
                {activeTab === "mobile" ? (
                  <Smartphone className="w-8 h-8 text-[#FF8FAB]" />
                ) : (
                  <Laptop className="w-8 h-8 text-[#4ECDC4]" />
                )}
                Device Configurations
              </h1>
              <p className="text-gray-500 mt-1">Manage brands, colors, RAM & storage options for products</p>
            </div>
            <Button 
              onClick={() => saveConfig(activeTab)}
              disabled={saving}
              className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-6"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save {activeTab === "mobile" ? "Mobile" : "Laptop"} Config
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("mobile")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "mobile"
                  ? "bg-[#FF8FAB] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Mobile Phones
            </button>
            <button
              onClick={() => setActiveTab("laptop")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "laptop"
                  ? "bg-[#4ECDC4] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              <Laptop className="w-5 h-5" />
              Laptops
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brands Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  🏷️ Brands
                </h2>
                <Button onClick={addBrand} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Brand
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {currentConfig.brands.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No brands added yet</p>
                ) : (
                  currentConfig.brands.map((brand, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={brand.name}
                        onChange={(e) => updateBrand(index, "name", e.target.value)}
                        placeholder="Brand name (e.g., Samsung)"
                        className="flex-1"
                      />
                      <Input
                        value={brand.logo}
                        onChange={(e) => updateBrand(index, "logo", e.target.value)}
                        placeholder="Logo URL (optional)"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeBrand(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Colors Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" /> Colors
                </h2>
                <Button onClick={addColor} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Color
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {currentConfig.colors.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No colors added yet</p>
                ) : (
                  currentConfig.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="color"
                        value={color.code}
                        onChange={(e) => updateColor(index, "code", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={color.name}
                        onChange={(e) => updateColor(index, "name", e.target.value)}
                        placeholder="Color name (e.g., Midnight Black)"
                        className="flex-1"
                      />
                      <Input
                        value={color.code}
                        onChange={(e) => updateColor(index, "code", e.target.value)}
                        placeholder="#000000"
                        className="w-28"
                      />
                      <button
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RAM Options Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" /> RAM Options
                </h2>
                <Button onClick={addRamOption} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add RAM
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {currentConfig.ram_options.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No RAM options added yet</p>
                ) : (
                  currentConfig.ram_options.map((ram, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={ram}
                        onChange={(e) => updateRamOption(index, e.target.value)}
                        placeholder="e.g., 8GB"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeRamOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB", "64GB"].map((ram) => (
                  <button
                    key={ram}
                    onClick={() => {
                      if (!currentConfig.ram_options.includes(ram)) {
                        setCurrentConfig(prev => ({
                          ...prev,
                          ram_options: [...prev.ram_options, ram]
                        }));
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      currentConfig.ram_options.includes(ram)
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Section (New/Used) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-500" /> Condition (New/Used)
                </h2>
                <Button onClick={addCondition} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Condition
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {currentConfig.conditions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No conditions added yet</p>
                ) : (
                  currentConfig.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={condition.name}
                        onChange={(e) => updateCondition(index, "name", e.target.value)}
                        placeholder="e.g., New, Used, Refurbished"
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Badge:</span>
                        <input
                          type="color"
                          value={condition.badge_color}
                          onChange={(e) => updateCondition(index, "badge_color", e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                      </div>
                      {/* Preview Badge */}
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: condition.badge_color,
                          color: '#FFFFFF'
                        }}
                      >
                        {condition.name || "Preview"}
                      </div>
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-xs text-gray-500 w-full mb-2">Quick Add:</span>
                {[
                  { name: "New", badge_color: "#4CAF50" },
                  { name: "Used", badge_color: "#FF9800" },
                  { name: "Refurbished", badge_color: "#2196F3" },
                  { name: "Open Box", badge_color: "#9C27B0" },
                  { name: "Like New", badge_color: "#00BCD4" }
                ].map((cond) => (
                  <button
                    key={cond.name}
                    onClick={() => {
                      if (!currentConfig.conditions.find(c => c.name === cond.name)) {
                        setCurrentConfig(prev => ({
                          ...prev,
                          conditions: [...prev.conditions, { ...cond, badge_text_color: "#FFFFFF" }]
                        }));
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all flex items-center gap-1 ${
                      currentConfig.conditions.find(c => c.name === cond.name)
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cond.badge_color }}
                    ></span>
                    {cond.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Options Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-green-500" /> Storage Options
                </h2>
                <Button onClick={addStorageOption} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Storage
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {currentConfig.storage_options.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No storage options added yet</p>
                ) : (
                  currentConfig.storage_options.map((storage, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={storage}
                        onChange={(e) => updateStorageOption(index, e.target.value)}
                        placeholder="e.g., 128GB"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeStorageOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"].map((storage) => (
                  <button
                    key={storage}
                    onClick={() => {
                      if (!currentConfig.storage_options.includes(storage)) {
                        setCurrentConfig(prev => ({
                          ...prev,
                          storage_options: [...prev.storage_options, storage]
                        }));
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      currentConfig.storage_options.includes(storage)
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Processors Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  ⚡ Processors
                </h2>
                <Button onClick={addProcessor} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Processor
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                {currentConfig.processors.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4 col-span-3">No processors added yet</p>
                ) : (
                  currentConfig.processors.map((processor, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Input
                        value={processor}
                        onChange={(e) => updateProcessor(index, e.target.value)}
                        placeholder="e.g., Snapdragon 8 Gen 2"
                        className="flex-1"
                      />
                      <button
                        onClick={() => removeProcessor(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Quick Add Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-xs text-gray-500 w-full mb-2">Quick Add:</span>
                {activeTab === "mobile" ? (
                  <>
                    {["Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2", "Apple A17 Pro", "Apple A16", "MediaTek Dimensity 9200", "Exynos 2400"].map((proc) => (
                      <button
                        key={proc}
                        onClick={() => {
                          if (!currentConfig.processors.includes(proc)) {
                            setCurrentConfig(prev => ({
                              ...prev,
                              processors: [...prev.processors, proc]
                            }));
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          currentConfig.processors.includes(proc)
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {proc}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M3", "Apple M3 Pro"].map((proc) => (
                      <button
                        key={proc}
                        onClick={() => {
                          if (!currentConfig.processors.includes(proc)) {
                            setCurrentConfig(prev => ({
                              ...prev,
                              processors: [...prev.processors, proc]
                            }));
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          currentConfig.processors.includes(proc)
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {proc}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Product Descriptions Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Product Descriptions
                </h2>
                <Button onClick={addDescription} size="sm" variant="outline" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Description
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Add multiple product descriptions that can be randomly used when creating products</p>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {currentConfig.descriptions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No descriptions added yet. Click "Add Description" to get started!</p>
                ) : (
                  currentConfig.descriptions.map((desc, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Description #{index + 1}</span>
                        <button
                          onClick={() => removeDescription(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <Input
                        value={desc.title}
                        onChange={(e) => updateDescription(index, "title", e.target.value)}
                        placeholder="Description Title (e.g., Premium Quality, Best Value)"
                        className="mb-3"
                      />
                      <Textarea
                        value={desc.text}
                        onChange={(e) => updateDescription(index, "text", e.target.value)}
                        placeholder="Write your product description here... (e.g., Experience the ultimate performance with this flagship device featuring cutting-edge technology...)"
                        className="min-h-[100px] resize-y"
                      />
                    </div>
                  ))
                )}
              </div>
              
              {/* Sample Descriptions Quick Add */}
              <div className="mt-4 pt-4 border-t">
                <span className="text-xs text-gray-500 block mb-3">Quick Add Sample Descriptions:</span>
                <div className="flex flex-wrap gap-2">
                  {activeTab === "mobile" ? (
                    <>
                      {[
                        { title: "Premium Flagship", text: "Experience the ultimate smartphone with cutting-edge technology, stunning display, and all-day battery life." },
                        { title: "Best Camera Phone", text: "Capture every moment in stunning detail with our advanced camera system featuring AI-powered photography." },
                        { title: "Gaming Powerhouse", text: "Dominate every game with blazing-fast performance, liquid cooling, and immersive display technology." },
                        { title: "Budget Champion", text: "Get premium features at an affordable price. Perfect balance of performance, quality, and value." }
                      ].map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentConfig(prev => ({
                              ...prev,
                              descriptions: [...prev.descriptions, sample]
                            }));
                          }}
                          className="px-3 py-1.5 text-xs rounded-full border bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                        >
                          + {sample.title}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { title: "Professional Workstation", text: "Power through demanding tasks with top-tier processing power, ample memory, and enterprise-grade reliability." },
                        { title: "Ultra-Portable", text: "Take your work anywhere with this lightweight powerhouse featuring all-day battery and stunning display." },
                        { title: "Gaming Beast", text: "Experience desktop-class gaming performance in a portable form factor with advanced cooling technology." },
                        { title: "Student Essential", text: "Perfect for studies and everyday tasks. Reliable performance, long battery life, and affordable price." }
                      ].map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentConfig(prev => ({
                              ...prev,
                              descriptions: [...prev.descriptions, sample]
                            }));
                          }}
                          className="px-3 py-1.5 text-xs rounded-full border bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                        >
                          + {sample.title}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warranty Section */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-500" /> Warranty Options
              </h2>
              <Button onClick={addWarranty} size="sm" variant="outline" className="rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Add Warranty
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Add warranty periods that will be available when creating products. You can add any custom warranty duration.</p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {currentConfig.warranties.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No warranty options added yet. Add your custom warranty periods below!</p>
              ) : (
                currentConfig.warranties.map((warranty, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      value={warranty.duration}
                      onChange={(e) => updateWarranty(index, "duration", e.target.value)}
                      placeholder="e.g., 7 Days, 1 Month, 1 Year"
                      className="flex-1"
                    />
                    <Input
                      value={warranty.description}
                      onChange={(e) => updateWarranty(index, "description", e.target.value)}
                      placeholder="Description (optional)"
                      className="flex-1"
                    />
                    {/* Preview Badge */}
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 whitespace-nowrap">
                      {warranty.duration || "Preview"}
                    </div>
                    <button
                      onClick={() => removeWarranty(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      data-testid={`remove-warranty-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Quick Add Buttons - Days Range */}
            <div className="mt-4 pt-4 border-t">
              <span className="text-xs text-gray-500 block mb-3">Quick Add Common Periods:</span>
              
              {/* Days Row */}
              <div className="mb-3">
                <span className="text-xs text-gray-400 mb-2 block">Days:</span>
                <div className="flex flex-wrap gap-2">
                  {["1 Day", "3 Days", "7 Days", "10 Days", "14 Days", "15 Days", "21 Days", "30 Days"].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (!currentConfig.warranties.find(w => w.duration === period)) {
                          setCurrentConfig(prev => ({
                            ...prev,
                            warranties: [...prev.warranties, { duration: period, description: "" }]
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        currentConfig.warranties.find(w => w.duration === period)
                          ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-testid={`quick-add-${period.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Months Row */}
              <div className="mb-3">
                <span className="text-xs text-gray-400 mb-2 block">Months:</span>
                <div className="flex flex-wrap gap-2">
                  {["1 Month", "2 Months", "3 Months", "6 Months", "9 Months"].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (!currentConfig.warranties.find(w => w.duration === period)) {
                          setCurrentConfig(prev => ({
                            ...prev,
                            warranties: [...prev.warranties, { duration: period, description: "" }]
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        currentConfig.warranties.find(w => w.duration === period)
                          ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-testid={`quick-add-${period.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Years Row */}
              <div className="mb-3">
                <span className="text-xs text-gray-400 mb-2 block">Years:</span>
                <div className="flex flex-wrap gap-2">
                  {["1 Year", "2 Years", "3 Years", "5 Years", "Lifetime"].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (!currentConfig.warranties.find(w => w.duration === period)) {
                          setCurrentConfig(prev => ({
                            ...prev,
                            warranties: [...prev.warranties, { duration: period, description: "" }]
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        currentConfig.warranties.find(w => w.duration === period)
                          ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-testid={`quick-add-${period.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Special Options Row */}
              <div>
                <span className="text-xs text-gray-400 mb-2 block">Special:</span>
                <div className="flex flex-wrap gap-2">
                  {["No Warranty", "Seller Warranty", "Brand Warranty", "Extended Warranty"].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        if (!currentConfig.warranties.find(w => w.duration === period)) {
                          setCurrentConfig(prev => ({
                            ...prev,
                            warranties: [...prev.warranties, { duration: period, description: "" }]
                          }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        currentConfig.warranties.find(w => w.duration === period)
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-testid={`quick-add-${period.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#FF8FAB]/10 to-[#4ECDC4]/10 rounded-xl border">
            <h3 className="font-bold text-[#1A1A1A] mb-2">
              {activeTab === "mobile" ? "📱 Mobile" : "💻 Laptop"} Configuration Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-[#FF8FAB]">{currentConfig.brands.length}</div>
                <div className="text-gray-500">Brands</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{currentConfig.colors.length}</div>
                <div className="text-gray-500">Colors</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{currentConfig.ram_options.length}</div>
                <div className="text-gray-500">RAM</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-500">{currentConfig.storage_options.length}</div>
                <div className="text-gray-500">Storage</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{currentConfig.processors.length}</div>
                <div className="text-gray-500">Processors</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-emerald-500">{currentConfig.conditions.length}</div>
                <div className="text-gray-500">Conditions</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-cyan-500">{currentConfig.warranties.length}</div>
                <div className="text-gray-500">Warranties</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-indigo-500">{currentConfig.descriptions.length}</div>
                <div className="text-gray-500">Descriptions</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
