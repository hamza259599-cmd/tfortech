import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, Trash2, Save, Palette, Cpu, HardDrive, 
  RefreshCw, FileText, Tag, Shield, Smartphone, Laptop
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DeviceConfigEditor({ initialDeviceType = "mobile", onConfigChange }) {
  const [activeTab, setActiveTab] = useState(initialDeviceType);
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
      
      const mobileData = {
        brands: mobileRes.data.brands || [],
        colors: mobileRes.data.colors || [],
        ram_options: mobileRes.data.ram_options || [],
        storage_options: mobileRes.data.storage_options || [],
        processors: mobileRes.data.processors || [],
        descriptions: mobileRes.data.descriptions || [],
        conditions: mobileRes.data.conditions || [],
        warranties: mobileRes.data.warranties || []
      };
      
      const laptopData = {
        brands: laptopRes.data.brands || [],
        colors: laptopRes.data.colors || [],
        ram_options: laptopRes.data.ram_options || [],
        storage_options: laptopRes.data.storage_options || [],
        processors: laptopRes.data.processors || [],
        descriptions: laptopRes.data.descriptions || [],
        conditions: laptopRes.data.conditions || [],
        warranties: laptopRes.data.warranties || []
      };
      
      setMobileConfig(mobileData);
      setLaptopConfig(laptopData);
      
      if (onConfigChange) {
        onConfigChange(activeTab === "mobile" ? mobileData : laptopData);
      }
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

  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(activeTab === "mobile" ? mobileConfig : laptopConfig);
    }
  }, [activeTab]);

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
      if (onConfigChange) {
        onConfigChange(config);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const currentConfig = activeTab === "mobile" ? mobileConfig : laptopConfig;
  const setCurrentConfig = activeTab === "mobile" ? setMobileConfig : setLaptopConfig;

  // CRUD Functions
  const addBrand = () => setCurrentConfig(prev => ({ ...prev, brands: [...prev.brands, { name: "", logo: "" }] }));
  const updateBrand = (index, field, value) => setCurrentConfig(prev => ({ ...prev, brands: prev.brands.map((b, i) => i === index ? { ...b, [field]: value } : b) }));
  const removeBrand = (index) => setCurrentConfig(prev => ({ ...prev, brands: prev.brands.filter((_, i) => i !== index) }));

  const addColor = () => setCurrentConfig(prev => ({ ...prev, colors: [...prev.colors, { name: "", code: "#000000" }] }));
  const updateColor = (index, field, value) => setCurrentConfig(prev => ({ ...prev, colors: prev.colors.map((c, i) => i === index ? { ...c, [field]: value } : c) }));
  const removeColor = (index) => setCurrentConfig(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));

  const addRamOption = () => setCurrentConfig(prev => ({ ...prev, ram_options: [...prev.ram_options, ""] }));
  const updateRamOption = (index, value) => setCurrentConfig(prev => ({ ...prev, ram_options: prev.ram_options.map((r, i) => i === index ? value : r) }));
  const removeRamOption = (index) => setCurrentConfig(prev => ({ ...prev, ram_options: prev.ram_options.filter((_, i) => i !== index) }));

  const addStorageOption = () => setCurrentConfig(prev => ({ ...prev, storage_options: [...prev.storage_options, ""] }));
  const updateStorageOption = (index, value) => setCurrentConfig(prev => ({ ...prev, storage_options: prev.storage_options.map((s, i) => i === index ? value : s) }));
  const removeStorageOption = (index) => setCurrentConfig(prev => ({ ...prev, storage_options: prev.storage_options.filter((_, i) => i !== index) }));

  const addProcessor = () => setCurrentConfig(prev => ({ ...prev, processors: [...prev.processors, ""] }));
  const updateProcessor = (index, value) => setCurrentConfig(prev => ({ ...prev, processors: prev.processors.map((p, i) => i === index ? value : p) }));
  const removeProcessor = (index) => setCurrentConfig(prev => ({ ...prev, processors: prev.processors.filter((_, i) => i !== index) }));

  const addCondition = () => setCurrentConfig(prev => ({ ...prev, conditions: [...prev.conditions, { name: "", badge_color: "#4CAF50" }] }));
  const updateCondition = (index, field, value) => setCurrentConfig(prev => ({ ...prev, conditions: prev.conditions.map((c, i) => i === index ? { ...c, [field]: value } : c) }));
  const removeCondition = (index) => setCurrentConfig(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));

  const addWarranty = () => setCurrentConfig(prev => ({ ...prev, warranties: [...prev.warranties, { duration: "", description: "" }] }));
  const updateWarranty = (index, field, value) => setCurrentConfig(prev => ({ ...prev, warranties: prev.warranties.map((w, i) => i === index ? { ...w, [field]: value } : w) }));
  const removeWarranty = (index) => setCurrentConfig(prev => ({ ...prev, warranties: prev.warranties.filter((_, i) => i !== index) }));

  const addDescription = () => setCurrentConfig(prev => ({ ...prev, descriptions: [...prev.descriptions, { title: "", text: "" }] }));
  const updateDescription = (index, field, value) => setCurrentConfig(prev => ({ ...prev, descriptions: prev.descriptions.map((d, i) => i === index ? { ...d, [field]: value } : d) }));
  const removeDescription = (index) => setCurrentConfig(prev => ({ ...prev, descriptions: prev.descriptions.filter((_, i) => i !== index) }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            {activeTab === "mobile" ? (
              <Smartphone className="w-6 h-6 text-[#3B82F6]" />
            ) : (
              <Laptop className="w-6 h-6 text-[#4ECDC4]" />
            )}
            Device Configurations
          </h2>
          <p className="text-gray-500 text-sm">Manage brands, colors, RAM & storage options for products</p>
        </div>
        <Button 
          onClick={() => saveConfig(activeTab)}
          disabled={saving}
          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full px-6"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save {activeTab === "mobile" ? "Mobile" : "Laptop"} Config
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("mobile")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === "mobile"
              ? "bg-[#3B82F6] text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-100 border"
          }`}
        >
          <Smartphone className="w-5 h-5" />
          Mobile Phones
        </button>
        <button
          type="button"
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

      {/* Main Grid - 2 Columns like AdminDevices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brands Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              🏷️ Brands
            </h3>
            <Button type="button" onClick={addBrand} size="sm" variant="outline" className="rounded-full">
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
                    type="button"
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
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-500" /> Colors
            </h3>
            <Button type="button" onClick={addColor} size="sm" variant="outline" className="rounded-full">
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
                    placeholder="Color name (e.g., Black)"
                    className="flex-1"
                  />
                  <Input
                    value={color.code}
                    onChange={(e) => updateColor(index, "code", e.target.value)}
                    placeholder="#000000"
                    className="w-28"
                  />
                  <button
                    type="button"
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
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" /> RAM Options
            </h3>
            <Button type="button" onClick={addRamOption} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add RAM
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
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
                    type="button"
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
            {["2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB"].map((ram) => (
              <button
                key={ram}
                type="button"
                onClick={() => {
                  if (!currentConfig.ram_options.includes(ram)) {
                    setCurrentConfig(prev => ({ ...prev, ram_options: [...prev.ram_options, ram] }));
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

        {/* Storage Options Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-500" /> Storage Options
            </h3>
            <Button type="button" onClick={addStorageOption} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add Storage
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
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
                    type="button"
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
                type="button"
                onClick={() => {
                  if (!currentConfig.storage_options.includes(storage)) {
                    setCurrentConfig(prev => ({ ...prev, storage_options: [...prev.storage_options, storage] }));
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

        {/* Condition Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" /> Condition (New/Used)
            </h3>
            <Button type="button" onClick={addCondition} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add Condition
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {currentConfig.conditions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No conditions added yet</p>
            ) : (
              currentConfig.conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="color"
                    value={condition.badge_color}
                    onChange={(e) => updateCondition(index, "badge_color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={condition.name}
                    onChange={(e) => updateCondition(index, "name", e.target.value)}
                    placeholder="e.g., New, Used"
                    className="flex-1"
                  />
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: condition.badge_color }}
                  >
                    {condition.name || "Preview"}
                  </div>
                  <button
                    type="button"
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
            {[
              { name: "New", badge_color: "#4CAF50" },
              { name: "Used", badge_color: "#FF9800" },
              { name: "Refurbished", badge_color: "#2196F3" }
            ].map((cond) => (
              <button
                key={cond.name}
                type="button"
                onClick={() => {
                  if (!currentConfig.conditions.find(c => c.name === cond.name)) {
                    setCurrentConfig(prev => ({ ...prev, conditions: [...prev.conditions, cond] }));
                  }
                }}
                className="px-3 py-1 text-xs rounded-full border bg-gray-50 hover:bg-gray-100 flex items-center gap-1"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cond.badge_color }}></span>
                {cond.name}
              </button>
            ))}
          </div>
        </div>

        {/* Warranty Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" /> Warranty
            </h3>
            <Button type="button" onClick={addWarranty} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add Warranty
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {currentConfig.warranties.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No warranty options added yet</p>
            ) : (
              currentConfig.warranties.map((warranty, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Input
                    value={warranty.duration}
                    onChange={(e) => updateWarranty(index, "duration", e.target.value)}
                    placeholder="e.g., 7 Days, 1 Year"
                    className="flex-1"
                  />
                  <Input
                    value={warranty.description}
                    onChange={(e) => updateWarranty(index, "description", e.target.value)}
                    placeholder="Description (optional)"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeWarranty(index)}
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
            {["7 Days", "15 Days", "1 Month", "3 Months", "6 Months", "1 Year", "No Warranty"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  if (!currentConfig.warranties.find(x => x.duration === w)) {
                    setCurrentConfig(prev => ({ ...prev, warranties: [...prev.warranties, { duration: w, description: "" }] }));
                  }
                }}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  currentConfig.warranties.find(x => x.duration === w)
                    ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Processors Section - Full Width */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              ⚡ Processors
            </h3>
            <Button type="button" onClick={addProcessor} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add Processor
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
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
                    type="button"
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
                {["Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2", "Apple A17 Pro", "Apple A16", "MediaTek Dimensity 9200"].map((proc) => (
                  <button
                    key={proc}
                    type="button"
                    onClick={() => {
                      if (!currentConfig.processors.includes(proc)) {
                        setCurrentConfig(prev => ({ ...prev, processors: [...prev.processors, proc] }));
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
                {["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M3"].map((proc) => (
                  <button
                    key={proc}
                    type="button"
                    onClick={() => {
                      if (!currentConfig.processors.includes(proc)) {
                        setCurrentConfig(prev => ({ ...prev, processors: [...prev.processors, proc] }));
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

        {/* Description Presets Section - Full Width */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Product Descriptions
            </h3>
            <Button type="button" onClick={addDescription} size="sm" variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" /> Add Description
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Add multiple product descriptions that can be used when creating products</p>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {currentConfig.descriptions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No descriptions added yet</p>
            ) : (
              currentConfig.descriptions.map((desc, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Description #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeDescription(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    value={desc.title}
                    onChange={(e) => updateDescription(index, "title", e.target.value)}
                    placeholder="Description Title (e.g., Premium Quality)"
                    className="mb-3"
                  />
                  <Textarea
                    value={desc.text}
                    onChange={(e) => updateDescription(index, "text", e.target.value)}
                    placeholder="Write your product description here..."
                    className="min-h-[80px] resize-y"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-[#3B82F6]/10 to-[#4ECDC4]/10 rounded-xl border">
        <h3 className="font-bold text-[#1A1A1A] mb-2">
          {activeTab === "mobile" ? "📱 Mobile" : "💻 Laptop"} Configuration Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-sm">
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-[#3B82F6]">{currentConfig.brands.length}</div>
            <div className="text-gray-500 text-xs">Brands</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-purple-500">{currentConfig.colors.length}</div>
            <div className="text-gray-500 text-xs">Colors</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-blue-500">{currentConfig.ram_options.length}</div>
            <div className="text-gray-500 text-xs">RAM</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-green-500">{currentConfig.storage_options.length}</div>
            <div className="text-gray-500 text-xs">Storage</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-orange-500">{currentConfig.processors.length}</div>
            <div className="text-gray-500 text-xs">Processors</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-emerald-500">{currentConfig.conditions.length}</div>
            <div className="text-gray-500 text-xs">Conditions</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-cyan-500">{currentConfig.warranties.length}</div>
            <div className="text-gray-500 text-xs">Warranties</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-xl font-bold text-indigo-500">{currentConfig.descriptions.length}</div>
            <div className="text-gray-500 text-xs">Descriptions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
