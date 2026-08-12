import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { 
  LayoutDashboard, Box, ClipboardList, Tags, Truck, 
  Image, Plus, Trash2, ArrowLeft, Save, X, Search,
  ChevronRight, DollarSign, Palette, Ruler, Info, FileText,
  Eye, ExternalLink, List, Package, Settings, Bold, Sparkles, Type, Check,
  Cpu, HardDrive, Tag, Shield, Wrench
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import StylishText from "../../components/StylishText";
import DeviceConfigEditor from "../../components/DeviceConfigEditor";
import ProductVariationsEditor from "../../components/ProductVariationsEditor";

// Simple Rich Text Editor Component
const SimpleRichEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isListActive, setIsListActive] = useState(false);
  
  // Check formatting status
  const checkFormatStatus = useCallback(() => {
    if (document.queryCommandState) {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsListActive(document.queryCommandState('insertUnorderedList'));
    }
  }, []);
  
  // Handle bold button click
  const handleBold = () => {
    document.execCommand('bold', false, null);
    editorRef.current?.focus();
    checkFormatStatus();
  };
  
  // Handle bullet list button click
  const handleBulletList = () => {
    document.execCommand('insertUnorderedList', false, null);
    editorRef.current?.focus();
    checkFormatStatus();
  };
  
  // Handle content change
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Set initial content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleBold}
          onMouseDown={(e) => e.preventDefault()}
          className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
            isBoldActive 
              ? 'bg-[#FF8FAB] text-white shadow-sm' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleBulletList}
          onMouseDown={(e) => e.preventDefault()}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            isListActive 
              ? 'bg-[#FF8FAB] text-white shadow-sm' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 ml-2">
          B = Bold | List = Bullet Points
        </span>
      </div>
      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onSelect={checkFormatStatus}
        onKeyUp={checkFormatStatus}
        onMouseUp={checkFormatStatus}
        className="min-h-[180px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8FAB]/20 rich-editor-content"
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Daraz-style hierarchical categories
const CATEGORY_TREE = [
  {
    id: "kids_baby",
    name: "Kids & Baby Fashion",
    children: [
      { id: "kids_clothes", name: "Kids Clothes" },
      { id: "baby_clothes", name: "Baby Clothes" },
      { id: "kids_shoes", name: "Kids Shoes" },
      { id: "school_supplies", name: "School Supplies" }
    ]
  },
  {
    id: "toys_games",
    name: "Toys & Games",
    children: [
      { id: "soft_toys", name: "Soft Toys" },
      { id: "action_figures", name: "Action Figures" },
      { id: "board_games", name: "Board Games" },
      { id: "outdoor_toys", name: "Outdoor Toys" }
    ]
  },
  {
    id: "educational",
    name: "Educational Items",
    children: [
      { id: "books", name: "Books" },
      { id: "learning_toys", name: "Learning Toys" },
      { id: "art_supplies", name: "Art Supplies" },
      { id: "science_kits", name: "Science Kits" }
    ]
  },
  {
    id: "fashion",
    name: "Fashion",
    children: [
      { id: "mens_fashion", name: "Men's Fashion" },
      { id: "womens_fashion", name: "Women's Fashion" },
      { id: "accessories", name: "Accessories" },
      { id: "watches", name: "Watches" }
    ]
  },
  {
    id: "electronics",
    name: "Electronics",
    children: [
      { id: "mobiles", name: "Mobiles & Tablets" },
      { id: "laptops", name: "Computers & Laptops" },
      { id: "gaming", name: "Gaming" },
      { id: "cameras", name: "Cameras" }
    ]
  },
  {
    id: "home_living",
    name: "Home & Living",
    children: [
      { id: "furniture", name: "Furniture" },
      { id: "decor", name: "Home Decor" },
      { id: "kitchen", name: "Kitchen" },
      { id: "bedding", name: "Bedding" }
    ]
  },
  {
    id: "health_beauty",
    name: "Health & Beauty",
    icon: "💄",
    children: [
      { id: "skincare", name: "Skincare", icon: "🧴" },
      { id: "makeup", name: "Makeup", icon: "💄" },
      { id: "personal_care", name: "Personal Care", icon: "🪥" },
      { id: "health", name: "Health Products", icon: "💊" }
    ]
  }
];

export default function ProductPublish() {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing product
  const isEditing = !!id;
  
  const [categories, setCategories] = useState([]);
  const [customAttributes, setCustomAttributes] = useState([]);
  const [customAttributeValues, setCustomAttributeValues] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentColorImageUpload, setCurrentColorImageUpload] = useState(null);
  
  // Gallery selection state
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);
  
  // Category selection state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Device Config state (for Mobiles/Laptops)
  const [deviceConfig, setDeviceConfig] = useState(null);
  const [deviceConfigLoading, setDeviceConfigLoading] = useState(false);
  const [selectedDeviceAttrs, setSelectedDeviceAttrs] = useState({
    brand: "",
    color: "",
    ram: "",
    storage: "",
    processor: "",
    condition: "",
    warranty: "",
    description_preset: ""
  });
  
  // Show config editor toggle
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  
  // Product Variations (Color, Size, Material, etc.)
  const [productVariations, setProductVariations] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    category: "",
    categoryPath: "",
    brand: "",
    image_urls: [],
    stock: "100",
    sku: "",
    weight: "",
    dimensions: "",
    warranty: "",
   
    video_url: "",
    is_sold_out: false
  });

  // Custom description fields
  const [highlights, setHighlights] = useState([{ text: "", bold: false }]);
  const [whatsInBox, setWhatsInBox] = useState([""]);
  const [specifications, setSpecifications] = useState([{ text: "", bold: false }]);
  
  // Stylish Words - words to render with playful styling
  const [stylishWords, setStylishWords] = useState([]);
  const [newStylishWord, setNewStylishWord] = useState("");
  const [stylishSettings, setStylishSettings] = useState({
    enabled: false,
    intensity: "medium",
    preset: "playful"
  });

  // Variations data
  const [hasVariations, setHasVariations] = useState(false);
  const [variationTypes, setVariationTypes] = useState({
    colors: false,
    sizes: false
  });
  // Colors with images and pricing
  const [colors, setColors] = useState([{ 
    name: "", 
    code: "#000000", 
    images: [],
    price: "",
    discount_price: "",
    stock: "100"
  }]);
  // Sizes with individual stock
  const [sizes, setSizes] = useState([{ name: "", stock: "100" }]);
  // Combined variations matrix for color+size combinations with editable prices
  const [combinedVariations, setCombinedVariations] = useState([]);
  // Custom bulk sizes input
  const [showCustomBulkInput, setShowCustomBulkInput] = useState(false);
  const [customBulkSizes, setCustomBulkSizes] = useState("");

  // Shipping data
  const [shippingData, setShippingData] = useState({
    package_weight: "",
    package_length: "",
    package_width: "",
    package_height: "",
    dangerous_goods: false
  });

  const tabs = [
    { id: "basic", label: "Basic Information", icon: Info },
    { id: "images", label: "Product Images", icon: Image },
    { id: "pricing", label: "Price, Stock & Variations", icon: DollarSign },
    { id: "description", label: "Description", icon: FileText },
    { id: "shipping", label: "Shipping", icon: Truck }
  ];

  useEffect(() => {
    fetchCategories();
    fetchCustomAttributes();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  // Generate/update combined variations matrix when colors or sizes change
  useEffect(() => {
    if (!variationTypes.colors || !variationTypes.sizes) return;
    
    const validColors = colors.filter(c => c.name.trim());
    const validSizes = sizes.filter(s => s.name.trim());
    
    if (validColors.length === 0 || validSizes.length === 0) return;
    
    // Generate new combinations while preserving existing data
    const newCombinations = [];
    validColors.forEach(color => {
      validSizes.forEach(size => {
        // Check if this combination already exists
        const existing = combinedVariations.find(
          v => v.color === color.name && v.size === size.name
        );
        
        if (existing) {
          // Keep existing data
          newCombinations.push(existing);
        } else {
          // Create new combination with defaults from color
          const skuBase = formData.sku || formData.name?.substring(0, 3)?.toUpperCase() || 'GJ';
          newCombinations.push({
            color: color.name,
            size: size.name,
            price: color.price || formData.price || "",
            discount_price: color.discount_price || formData.discount_price || "",
            stock: "100",
            sku: `${skuBase}-${color.name.replace(/\s+/g, '')}-${size.name}`,
            images: color.images || []
          });
        }
      });
    });
    
    setCombinedVariations(newCombinations);
  }, [colors, sizes, variationTypes.colors, variationTypes.sizes]);

  // Fetch device config when category is Mobiles or Laptops
  const fetchDeviceConfig = async (categoryName) => {
    const lowerCat = categoryName?.toLowerCase() || "";
    const isMobile = lowerCat.includes("mobile") || lowerCat.includes("phone");
    const isLaptop = lowerCat.includes("laptop") || lowerCat.includes("computer");
    
    if (!isMobile && !isLaptop) {
      setDeviceConfig(null);
      return;
    }
    
    const deviceType = isMobile ? "mobile" : "laptop";
    setDeviceConfigLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/device-config/${deviceType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceConfig(response.data);
    } catch (error) {
      console.error("Error fetching device config:", error);
      setDeviceConfig(null);
    } finally {
      setDeviceConfigLoading(false);
    }
  };

  // Check if category is electronics (mobile/laptop)
  const isElectronicsCategory = () => {
    const cat = formData.categoryPath?.toLowerCase() || formData.category?.toLowerCase() || "";
    return cat.includes("mobile") || cat.includes("phone") || cat.includes("laptop") || cat.includes("computer");
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCustomAttributes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/admin/custom-attributes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomAttributes(response.data);
    } catch (error) {
      console.error("Error fetching custom attributes:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        discount_price: product.discount_price?.toString() || "",
        category: product.category || "",
        categoryPath: product.categoryPath || "",
        brand: product.brand || "",
        image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
        stock: product.stock?.toString() || "100",
        sku: product.sku || "",
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        warranty: product.warranty || "",
                video_url: product.video_url || "",
        is_sold_out: product.is_sold_out || false
      });
      
      // Load color variations with full data (images, prices, stock)
      if (product.color_variations && product.color_variations.length > 0) {
        setHasVariations(true);
        setVariationTypes(prev => ({ ...prev, colors: true }));
        setColors(product.color_variations.map(cv => ({
          name: cv.name || "",
          code: cv.code || getColorCode(cv.name) || "#000000",
          images: cv.images || [],
          price: cv.price?.toString() || "",
          discount_price: cv.discount_price?.toString() || "",
          stock: cv.stock?.toString() || "100"
        })));
      } else if (product.colors && product.colors.length > 0) {
        // Fallback to old simple colors format
        setHasVariations(true);
        setVariationTypes(prev => ({ ...prev, colors: true }));
        setColors(product.colors.map(c => ({ 
          name: c, 
          code: getColorCode(c), 
          images: [], 
          price: "", 
          discount_price: "", 
          stock: "100" 
        })));
      }
      
      // Load size variations with stock
      if (product.size_variations && product.size_variations.length > 0) {
        setHasVariations(true);
        setVariationTypes(prev => ({ ...prev, sizes: true }));
        setSizes(product.size_variations.map(sv => ({
          name: sv.name || "",
          stock: sv.stock?.toString() || "100"
        })));
      } else if (product.sizes && product.sizes.length > 0) {
        // Fallback to old simple sizes format
        setHasVariations(true);
        setVariationTypes(prev => ({ ...prev, sizes: true }));
        setSizes(product.sizes.map(s => ({ name: s, stock: "100" })));
      }

      // Load custom description fields
      if (product.highlights && product.highlights.length > 0) {
        setHighlights(product.highlights);
      }
      if (product.whats_in_box && product.whats_in_box.length > 0) {
        setWhatsInBox(product.whats_in_box);
      }
      if (product.specifications && product.specifications.length > 0) {
        // Handle both old format (string) and new format (object with text and bold)
        setSpecifications(product.specifications.map(spec => 
          typeof spec === 'string' ? { text: spec, bold: false } : spec
        ));
      }

      // Load combined variations if they exist
      if (product.variations && product.variations.length > 0) {
        setCombinedVariations(product.variations.map(v => ({
          color: v.color || "",
          size: v.size || "",
          price: v.price?.toString() || "",
          discount_price: v.discount_price?.toString() || "",
          stock: v.stock?.toString() || "100",
          sku: v.sku || "",
          images: v.images || []
        })));
      }
      
      // Load stylish words settings
      if (product.stylish_words) {
        setStylishWords(product.stylish_words);
      }
      if (product.stylish_settings) {
        setStylishSettings(product.stylish_settings);
      }

      // Load device specs if Mobile/Laptop category
      if (product.device_specs) {
        setSelectedDeviceAttrs({
          brand: product.device_specs.brand || "",
          color: product.device_specs.color || "",
          ram: product.device_specs.ram || "",
          storage: product.device_specs.storage || "",
          processor: product.device_specs.processor || "",
          condition: product.device_specs.condition || "",
          warranty: product.device_specs.warranty || "",
          description_preset: ""
        });
      }
      
      // Load product variations
      if (product.product_variations) {
        setProductVariations(product.product_variations);
      }
      
      // Fetch device config if electronics category
      fetchDeviceConfig(product.category);

      toast.success("Product loaded for editing");
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
      navigate("/admin/products");
    }
  };

  const getColorCode = (colorName) => {
    const colorCodes = {
      "Black": "#000000", "White": "#FFFFFF", "Red": "#FF0000",
      "Blue": "#0066CC", "Navy": "#001F3F", "Green": "#2ECC40",
      "Yellow": "#FFDC00", "Pink": "#FF69B4", "Purple": "#9B59B6",
      "Orange": "#FF851B", "Brown": "#8B4513", "Grey": "#808080",
      "Gray": "#808080", "Beige": "#F5F5DC", "Maroon": "#800000"
    };
    return colorCodes[colorName] || "#000000";
  };

  // Category selection handlers
  const handleCategorySelect = (parent, child) => {
    setSelectedParentCategory(parent);
    setSelectedCategory(child);
    setFormData(prev => ({
      ...prev,
      category: child.id,
      categoryPath: `${parent.name} > ${child.name}`
    }));
    setCategoryModalOpen(false);
    setCategorySearch("");
  };

  const getFilteredCategories = () => {
    // Use database categories instead of hardcoded CATEGORY_TREE
    if (!categories || categories.length === 0) return [];
    
    if (!categorySearch) return categories;
    
    const searchLower = categorySearch.toLowerCase();
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower)
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Multiple Image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        try {
          const response = await axios.post(`${API}/upload/image`, { image: base64 });
          const imageUrl = `${BACKEND_URL}${response.data.image_url}`;
          
          // If uploading for a specific color variation
          if (currentColorImageUpload !== null) {
            setColors(prev => prev.map((c, i) => 
              i === currentColorImageUpload 
                ? { ...c, images: [...c.images, imageUrl] }
                : c
            ));
          } else {
            // General product images
            setFormData(prev => ({
              ...prev,
              image_urls: [...prev.image_urls, imageUrl]
            }));
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Image upload failed");
        }
      };
      reader.readAsDataURL(file);
    }
    
    setImageUploading(false);
    setCurrentColorImageUpload(null);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  // Gallery functions
  const fetchGalleryImages = async () => {
    setGalleryLoading(true);
    try {
      const response = await axios.get(`${API}/gallery`);
      setGalleryImages(response.data || []);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setGalleryLoading(false);
    }
  };

  const openGalleryModal = () => {
    setGalleryModalOpen(true);
    setSelectedGalleryImages([]);
    fetchGalleryImages();
  };

  const toggleGalleryImageSelection = (imageUrl) => {
    setSelectedGalleryImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      }
      return [...prev, imageUrl];
    });
  };

  const addSelectedGalleryImages = () => {
    if (selectedGalleryImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, ...selectedGalleryImages]
    }));
    setGalleryModalOpen(false);
    setSelectedGalleryImages([]);
    toast.success(`${selectedGalleryImages.length} image(s) added from gallery`);
  };

  // Remove color image
  const removeColorImage = (colorIndex, imageIndex) => {
    setColors(prev => prev.map((c, i) => 
      i === colorIndex 
        ? { ...c, images: c.images.filter((_, idx) => idx !== imageIndex) }
        : c
    ));
  };

  // Color handlers
  const addColor = () => {
    setColors(prev => [...prev, { 
      name: "", 
      code: "#000000", 
      images: [],
      price: "",
      discount_price: "",
      stock: "100"
    }]);
  };

  const updateColor = (index, field, value) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const removeColor = (index) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Size handlers
  const addSize = () => {
    setSizes(prev => [...prev, { name: "", stock: "100" }]);
  };

  const updateSize = (index, field, value) => {
    setSizes(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeSize = (index) => {
    if (sizes.length > 1) {
      setSizes(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Combined variation matrix update handler
  const updateCombinedVariation = (colorName, sizeName, field, value) => {
    setCombinedVariations(prev => prev.map(v => 
      (v.color === colorName && v.size === sizeName) 
        ? { ...v, [field]: value } 
        : v
    ));
  };

  // Bulk update all variations with same price
  const applyPriceToAll = () => {
    if (!formData.price) {
      toast.error("Please enter a base price first");
      return;
    }
    setCombinedVariations(prev => prev.map(v => ({
      ...v,
      price: formData.price,
      discount_price: formData.discount_price || ""
    })));
    toast.success("Price applied to all variations");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      setActiveTab("basic");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      setActiveTab("basic");
      return;
    }
    
    // Check if has variations - validate variation prices
    if (hasVariations && variationTypes.colors) {
      const validColors = colors.filter(c => c.name.trim());
      if (validColors.length === 0) {
        toast.error("Please add at least one color");
        setActiveTab("variations");
        return;
      }
      // Check if at least one color has images
      const hasImages = validColors.some(c => c.images.length > 0);
      if (!hasImages && formData.image_urls.length === 0) {
        toast.error("Please upload at least one image");
        setActiveTab("variations");
        return;
      }
    } else {
      if (!formData.price) {
        toast.error("Price is required");
        setActiveTab("pricing");
        return;
      }
      if (formData.image_urls.length === 0) {
        toast.error("Please upload at least one image");
        setActiveTab("images");
        return;
      }
    }

    setSaving(true);

    // Prepare color variations with images and pricing
    const colorVariations = variationTypes.colors 
      ? colors.filter(c => c.name.trim()).map(c => ({
          name: c.name,
          code: c.code,
          images: c.images,
          price: c.price ? parseFloat(c.price) : null,
          discount_price: c.discount_price ? parseFloat(c.discount_price) : null,
          stock: c.stock ? parseInt(c.stock) : 100
        }))
      : null;

    // Prepare size variations with stock
    const sizeVariations = variationTypes.sizes 
      ? sizes.filter(s => s.name.trim()).map(s => ({
          name: s.name,
          stock: s.stock ? parseInt(s.stock) : 100
        }))
      : null;

    // Use the editable combined variations matrix if both colors and sizes are selected
    let finalCombinedVariations = null;
    if (variationTypes.colors && variationTypes.sizes && combinedVariations.length > 0) {
      // Use the user-edited matrix data
      finalCombinedVariations = combinedVariations.map(v => {
        const colorData = colors.find(c => c.name === v.color);
        return {
          color: v.color,
          size: v.size,
          price: v.price ? parseFloat(v.price) : parseFloat(formData.price) || 0,
          discount_price: v.discount_price ? parseFloat(v.discount_price) : null,
          stock: v.stock ? parseInt(v.stock) : 100,
          sku: v.sku || "",
          images: colorData?.images || []
        };
      });
    } else if (variationTypes.colors && colorVariations) {
      // Only colors - create variations with color only
      finalCombinedVariations = colorVariations.map(color => ({
        color: color.name,
        size: null,
        price: color.price || parseFloat(formData.price) || 0,
        discount_price: color.discount_price || (formData.discount_price ? parseFloat(formData.discount_price) : null),
        stock: color.stock || 100,
        images: color.images || []
      }));
    } else if (variationTypes.sizes && sizeVariations) {
      // Only sizes - create variations with size only
      finalCombinedVariations = sizeVariations.map(size => ({
        color: null,
        size: size.name,
        price: parseFloat(formData.price) || 0,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: size.stock || 100,
        images: []
      }));
    }

    // Get all images (general + color specific)
    let allImages = [...formData.image_urls];
    if (colorVariations) {
      colorVariations.forEach(cv => {
        allImages = [...allImages, ...cv.images];
      });
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || (finalCombinedVariations && finalCombinedVariations[0]?.price) || 0,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      category: formData.category,
      brand: formData.brand || null,
      image_url: allImages[0] || "",
      image_urls: allImages,
      stock: parseInt(formData.stock) || 100,
      sku: formData.sku || null,
      weight: formData.weight || null,
      dimensions: formData.dimensions || null,
      warranty: formData.warranty || null,
      video_url: formData.video_url ? formData.video_url.trim() : null,
      sizes: variationTypes.sizes ? sizes.filter(s => s.name.trim()).map(s => s.name) : null,
      size_variations: sizeVariations,
      colors: variationTypes.colors ? colors.filter(c => c.name.trim()).map(c => c.name) : null,
      color_variations: colorVariations,
      variations: finalCombinedVariations, // Combined color+size variations with individual prices & stock
      is_sold_out: formData.is_sold_out,
      // Device specifications for Mobiles/Laptops
      device_specs: isElectronicsCategory() ? {
        brand: selectedDeviceAttrs.brand || null,
        color: selectedDeviceAttrs.color || null,
        ram: selectedDeviceAttrs.ram || null,
        storage: selectedDeviceAttrs.storage || null,
        processor: selectedDeviceAttrs.processor || null,
        condition: selectedDeviceAttrs.condition || null,
        warranty: selectedDeviceAttrs.warranty || null
      } : null,
      // Product Variations (Color, Size, Material, Warranty, etc.)
      product_variations: productVariations.length > 0 ? productVariations : null,
      // Custom description fields
      highlights: highlights
        .filter(h => typeof h === 'string' ? h.trim() : h.text?.trim())
        .map(h => typeof h === 'string' ? { text: h, bold: false } : h),
      whats_in_box: whatsInBox.filter(w => w.trim()),
      specifications: specifications
        .filter(s => typeof s === 'string' ? s.trim() : s.text?.trim())
        .map(s => typeof s === 'string' ? { text: s, bold: false } : s),
      custom_attributes: customAttributeValues,
      // Stylish Words
      stylish_words: stylishWords,
      stylish_settings: stylishSettings
    };

    try {
      if (isEditing) {
        await axios.put(`${API}/products/${id}`, productData);
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`${API}/products`, productData);
        toast.success("Product published successfully!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.detail || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
                  {isEditing ? "Edit Product" : "Publish New Product"}
                </h1>
                <p className="text-sm text-gray-500">Fill in the product details below</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isEditing && (
                <a
                  href={`/product/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#06D6A0]/10 hover:bg-[#06D6A0]/20 text-[#06D6A0] rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Button variant="outline" onClick={() => navigate("/admin/products")} className="rounded-lg">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={saving}
                className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-lg"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEditing ? "Update Product" : "Publish Product"}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex border-b overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#FF8FAB] text-[#FF8FAB]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Include keywords that buyers would use to search for your item
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      {/* Daraz-style Category Selector */}
                      <div className="mt-2 relative">
                        <button
                          type="button"
                          onClick={() => setCategoryModalOpen(true)}
                          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-left transition-colors ${
                            formData.categoryPath ? 'border-[#FF8FAB] bg-[#FF8FAB]/5' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className={formData.categoryPath ? 'text-[#1A1A1A]' : 'text-gray-400'}>
                            {formData.categoryPath || 'Select category'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Category Selection Modal */}
                      {categoryModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <div className="p-4 border-b flex items-center justify-between">
                              <h3 className="font-heading text-lg font-bold">Select Category</h3>
                              <button 
                                onClick={() => { setCategoryModalOpen(false); setCategorySearch(""); }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                            
                            {/* Search Box */}
                            <div className="p-4 border-b">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                  value={categorySearch}
                                  onChange={(e) => setCategorySearch(e.target.value)}
                                  placeholder="Search categories..."
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            {/* Category List */}
                            <div className="max-h-[50vh] overflow-y-auto p-2">
                              {getFilteredCategories().length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <p>No categories found</p>
                                  <p className="text-sm mt-1">Create categories in Admin Panel → Categories</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {getFilteredCategories().map((cat) => (
                                    <button
                                      key={cat.category_id || cat.id}
                                      type="button"
                                      onClick={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                        category: cat.category_id || cat.id,
                                          categoryPath: cat.name
                                        }));
                                        setCategoryModalOpen(false);
                                        setCategorySearch("");
                                        // Fetch device config if Mobile/Laptop category
                                        fetchDeviceConfig(cat.name);
                                      }}
                                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        formData.category === (cat.category_id || cat.id)
                                          ? 'bg-[#FF8FAB]/10 text-[#FF8FAB] border-2 border-[#FF8FAB]' 
                                          : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                                      }`}
                                    >
                                      <span className="text-2xl">{cat.icon || '📦'}</span>
                                      <span className="font-medium">{cat.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Enter brand name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku" className="text-sm font-medium">SKU (Stock Keeping Unit)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="sku"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          placeholder="e.g., SHIRT-BLU-M-001"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase().replace(/\s/g, '') : 'PRD';
                            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                            const sku = `${prefix}-${random}`;
                            setFormData(prev => ({ ...prev, sku }));
                          }}
                          className="whitespace-nowrap"
                        >
                          🎲 Generate
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Custom code to identify this product (auto-generate or enter manually)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">
                      Product Images <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Upload at least 1 image. First image will be the cover photo.
                      {hasVariations && variationTypes.colors && (
                        <span className="text-[#FF8FAB]"> You can also add images per color in Variations tab.</span>
                      )}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* Uploaded Images */}
                      {formData.image_urls.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className={`aspect-square rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-[#FF8FAB]' : 'border-gray-200'}`}>
                            <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-[#FF8FAB] text-white text-xs px-2 py-1 rounded">
                              Cover
                            </span>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload Button */}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {imageUploading && currentColorImageUpload === null ? (
                          <div className="w-8 h-8 border-2 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-400">Upload Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      
                      {/* Select from Gallery Button */}
                      <button
                        type="button"
                        onClick={openGalleryModal}
                        className="aspect-square rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
                      >
                        <Image className="w-8 h-8 text-purple-500 mb-2" />
                        <span className="text-xs text-purple-600 font-medium">From Gallery</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📸 Image Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use high quality images (minimum 500x500 pixels)</li>
                      <li>• White background recommended</li>
                      <li>• Show product from multiple angles</li>
                      <li>• Avoid watermarks and text on images</li>
                    </ul>
                  </div>
                  
                                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <Label htmlFor="video_url" className="text-sm font-medium">🎬 Product Video (YouTube Link)</Label>
                  <p className="text-xs text-gray-400 mt-1 mb-2">Paste a YouTube video link to show a product video on the product page (optional).</p>
                  <Input
                    id="video_url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="e.g., https://www.youtube.com/watch?v=xxxxxxxxxxx"
                    className="mt-1"
                  />
                </div>

{/* Gallery Modal */}
                  {galleryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setGalleryModalOpen(false)}>
                      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex items-center justify-between">
                          <div>
                            <h3 className="font-heading text-xl font-bold text-[#1A1A1A]">Select from Gallery</h3>
                            <p className="text-sm text-gray-500">Choose images from your saved gallery</p>
                          </div>
                          <button onClick={() => setGalleryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                          {galleryLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="w-10 h-10 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : galleryImages.length === 0 ? (
                            <div className="text-center py-12">
                              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">No images in gallery</p>
                              <p className="text-sm text-gray-400">Go to Admin → Gallery to upload images first</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {galleryImages.map((image) => (
                                <div
                                  key={image.image_id}
                                  onClick={() => toggleGalleryImageSelection(image.url)}
                                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${
                                    selectedGalleryImages.includes(image.url)
                                      ? 'border-[#FF8FAB] ring-4 ring-[#FF8FAB]/30'
                                      : 'border-transparent hover:border-gray-300'
                                  }`}
                                >
                                  <img src={image.url} alt={image.title || "Gallery"} className="w-full h-full object-cover" />
                                  {selectedGalleryImages.includes(image.url) && (
                                    <div className="absolute inset-0 bg-[#FF8FAB]/20 flex items-center justify-center">
                                      <div className="w-8 h-8 bg-[#FF8FAB] rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {selectedGalleryImages.length} image(s) selected
                          </p>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setGalleryModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={addSelectedGalleryImages}
                              disabled={selectedGalleryImages.length === 0}
                              className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
                            >
                              Add Selected ({selectedGalleryImages.length})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  {/* Base Pricing Section */}
                  <div className="bg-white rounded-xl border p-4">
                    <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#FF8FAB]" />
                      Base Price & Stock
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="price" className="text-sm font-medium">
                          Price (Rs.) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount_price" className="text-sm font-medium">
                          Special Price (Rs.)
                        </Label>
                        <Input
                          id="discount_price"
                          name="discount_price"
                          type="number"
                          value={formData.discount_price}
                          onChange={handleInputChange}
                          placeholder="Leave empty if no discount"
                          className="mt-2"
                        />
                        {formData.price && formData.discount_price && (
                          <p className="text-xs text-green-600 mt-1">
                            {Math.round(((parseFloat(formData.price) - parseFloat(formData.discount_price)) / parseFloat(formData.price)) * 100)}% discount
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="stock" className="text-sm font-medium">
                          Stock Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={formData.stock}
                          onChange={handleInputChange}
                          placeholder="100"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mt-4">
                      <input
                        type="checkbox"
                        id="is_sold_out"
                        name="is_sold_out"
                        checked={formData.is_sold_out}
                        onChange={handleInputChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#FF8FAB] focus:ring-[#FF8FAB]"
                      />
                      <label htmlFor="is_sold_out" className="text-sm font-medium cursor-pointer">
                        Mark as Sold Out
                      </label>
                      {formData.is_sold_out && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Product will not be available for purchase
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Device Configurations Section - Always visible in Price tab */}
                  <div className="bg-gray-50 rounded-xl border-2 border-dashed border-[#4ECDC4]/30 p-4">
                    <DeviceConfigEditor 
                      initialDeviceType={formData.categoryPath?.toLowerCase().includes("laptop") ? "laptop" : "mobile"}
                      onConfigChange={(newConfig) => {
                        setDeviceConfig(newConfig);
                      }}
                    />
                    
                    {/* Selection Dropdowns - After Config */}
                    {deviceConfig && (
                      <div className="mt-6 pt-6 border-t-2 border-[#4ECDC4]/20">
                        <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                          <Tag className="w-5 h-5 text-[#FF8FAB]" />
                          Select Specifications for This Product
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Brand Selection */}
                            {deviceConfig.brands?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">🏷️ Brand</Label>
                                <Select
                                  value={selectedDeviceAttrs.brand}
                                  onValueChange={(val) => {
                                    setSelectedDeviceAttrs(prev => ({ ...prev, brand: val }));
                                    setFormData(prev => ({ ...prev, brand: val }));
                                  }}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-brand-select">
                                    <SelectValue placeholder="Select Brand" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.brands.map((brand, idx) => (
                                      <SelectItem key={idx} value={brand.name}>{brand.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Color Selection */}
                            {deviceConfig.colors?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><Palette className="w-4 h-4 inline mr-1 text-purple-500" /> Color</Label>
                                <Select
                                  value={selectedDeviceAttrs.color}
                                  onValueChange={(val) => setSelectedDeviceAttrs(prev => ({ ...prev, color: val }))}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-color-select">
                                    <SelectValue placeholder="Select Color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.colors.map((color, idx) => (
                                      <SelectItem key={idx} value={color.name}>
                                        <div className="flex items-center gap-2">
                                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.code }}></span>
                                          {color.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* RAM Selection */}
                            {deviceConfig.ram_options?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><Cpu className="w-4 h-4 inline mr-1 text-blue-500" /> RAM</Label>
                                <Select
                                  value={selectedDeviceAttrs.ram}
                                  onValueChange={(val) => setSelectedDeviceAttrs(prev => ({ ...prev, ram: val }))}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-ram-select">
                                    <SelectValue placeholder="Select RAM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.ram_options.map((ram, idx) => (
                                      <SelectItem key={idx} value={ram}>{ram}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Storage Selection */}
                            {deviceConfig.storage_options?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><HardDrive className="w-4 h-4 inline mr-1 text-green-500" /> Storage</Label>
                                <Select
                                  value={selectedDeviceAttrs.storage}
                                  onValueChange={(val) => setSelectedDeviceAttrs(prev => ({ ...prev, storage: val }))}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-storage-select">
                                    <SelectValue placeholder="Select Storage" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.storage_options.map((storage, idx) => (
                                      <SelectItem key={idx} value={storage}>{storage}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Processor Selection */}
                            {deviceConfig.processors?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium">⚡ Processor</Label>
                                <Select
                                  value={selectedDeviceAttrs.processor}
                                  onValueChange={(val) => setSelectedDeviceAttrs(prev => ({ ...prev, processor: val }))}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-processor-select">
                                    <SelectValue placeholder="Select Processor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.processors.map((proc, idx) => (
                                      <SelectItem key={idx} value={proc}>{proc}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Condition Selection */}
                            {deviceConfig.conditions?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><Tag className="w-4 h-4 inline mr-1 text-emerald-500" /> Condition</Label>
                                <Select
                                  value={selectedDeviceAttrs.condition}
                                  onValueChange={(val) => setSelectedDeviceAttrs(prev => ({ ...prev, condition: val }))}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-condition-select">
                                    <SelectValue placeholder="Select Condition" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.conditions.map((cond, idx) => (
                                      <SelectItem key={idx} value={cond.name}>
                                        <div className="flex items-center gap-2">
                                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cond.badge_color }}></span>
                                          {cond.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Warranty Selection */}
                            {deviceConfig.warranties?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><Shield className="w-4 h-4 inline mr-1 text-cyan-500" /> Warranty</Label>
                                <Select
                                  value={selectedDeviceAttrs.warranty}
                                  onValueChange={(val) => {
                                    setSelectedDeviceAttrs(prev => ({ ...prev, warranty: val }));
                                    setFormData(prev => ({ ...prev, warranty: val }));
                                  }}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-warranty-select">
                                    <SelectValue placeholder="Select Warranty" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.warranties.map((warranty, idx) => (
                                      <SelectItem key={idx} value={warranty.duration}>{warranty.duration}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Description Preset Selection */}
                            {deviceConfig.descriptions?.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium"><FileText className="w-4 h-4 inline mr-1 text-indigo-500" /> Description</Label>
                                <Select
                                  value={selectedDeviceAttrs.description_preset}
                                  onValueChange={(val) => {
                                    setSelectedDeviceAttrs(prev => ({ ...prev, description_preset: val }));
                                    const desc = deviceConfig.descriptions.find(d => d.title === val);
                                    if (desc) {
                                      setFormData(prev => ({ ...prev, description: desc.text }));
                                      toast.success(`Applied "${desc.title}" description`);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="mt-2" data-testid="device-description-select">
                                    <SelectValue placeholder="Select Description" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deviceConfig.descriptions.map((desc, idx) => (
                                      <SelectItem key={idx} value={desc.title}>{desc.title}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          {/* Selected Specs Summary */}
                          {(selectedDeviceAttrs.brand || selectedDeviceAttrs.ram || selectedDeviceAttrs.storage) && (
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                              <p className="text-sm text-gray-500 mb-2">Selected Specifications:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedDeviceAttrs.brand && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">🏷️ {selectedDeviceAttrs.brand}</span>
                                )}
                                {selectedDeviceAttrs.color && (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">🎨 {selectedDeviceAttrs.color}</span>
                                )}
                                {selectedDeviceAttrs.ram && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">💾 {selectedDeviceAttrs.ram}</span>
                                )}
                                {selectedDeviceAttrs.storage && (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">💿 {selectedDeviceAttrs.storage}</span>
                                )}
                                {selectedDeviceAttrs.processor && (
                                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">⚡ {selectedDeviceAttrs.processor}</span>
                                )}
                                {selectedDeviceAttrs.condition && (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">✓ {selectedDeviceAttrs.condition}</span>
                                )}
                                {selectedDeviceAttrs.warranty && (
                                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">🛡️ {selectedDeviceAttrs.warranty}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  {/* Product Variations Editor (Color, Size, Material, Warranty, etc.) */}
                  <ProductVariationsEditor 
                    variations={productVariations}
                    onChange={(newVariations) => setProductVariations(newVariations)}
                  />

                  {/* Legacy Variations Section */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="hasVariations"
                        checked={hasVariations}
                        onChange={(e) => setHasVariations(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#FF8FAB] focus:ring-[#FF8FAB]"
                      />
                      <label htmlFor="hasVariations" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[#FF8FAB]" />
                        This product has variations (different colors, sizes with different prices)
                      </label>
                    </div>

                    {hasVariations && (
                      <div className="space-y-6 pt-4 border-t">
                        {/* Variation Type Selection */}
                        <div className="grid grid-cols-2 gap-4">
                          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${variationTypes.colors ? 'border-[#FF8FAB] bg-[#FF8FAB]/5' : 'border-gray-200'}`}>
                            <input
                              type="checkbox"
                              checked={variationTypes.colors}
                              onChange={(e) => setVariationTypes(prev => ({...prev, colors: e.target.checked}))}
                              className="w-5 h-5 rounded border-gray-300 text-[#FF8FAB] focus:ring-[#FF8FAB]"
                            />
                            <div>
                              <Palette className="w-5 h-5 text-[#FF8FAB] mb-1" />
                              <span className="font-medium">Color</span>
                            </div>
                          </label>
                          <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${variationTypes.sizes ? 'border-[#FF8FAB] bg-[#FF8FAB]/5' : 'border-gray-200'}`}>
                            <input
                              type="checkbox"
                              checked={variationTypes.sizes}
                              onChange={(e) => setVariationTypes(prev => ({...prev, sizes: e.target.checked}))}
                              className="w-5 h-5 rounded border-gray-300 text-[#FF8FAB] focus:ring-[#FF8FAB]"
                            />
                            <div>
                              <Ruler className="w-5 h-5 text-[#FF8FAB] mb-1" />
                              <span className="font-medium">Size</span>
                            </div>
                          </label>
                        </div>

                        {/* Colors Section with Images & Pricing */}
                        {variationTypes.colors && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-medium text-lg">Color Variations</h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Bulk Add Colors Dropdown */}
                                <Select onValueChange={(value) => {
                                  let newColors = [];
                                  if (value === "basic") {
                                    newColors = [
                                      { name: "Black", code: "#000000" },
                                      { name: "White", code: "#FFFFFF" },
                                      { name: "Red", code: "#FF0000" },
                                      { name: "Blue", code: "#0066CC" },
                                      { name: "Green", code: "#2ECC40" }
                                    ];
                                  } else if (value === "neutral") {
                                    newColors = [
                                      { name: "Black", code: "#000000" },
                                      { name: "White", code: "#FFFFFF" },
                                      { name: "Grey", code: "#808080" },
                                      { name: "Beige", code: "#F5F5DC" },
                                      { name: "Brown", code: "#8B4513" }
                                    ];
                                  } else if (value === "kids") {
                                    newColors = [
                                      { name: "Pink", code: "#FF69B4" },
                                      { name: "Blue", code: "#4CC9F0" },
                                      { name: "Yellow", code: "#FFDC00" },
                                      { name: "Green", code: "#2ECC40" },
                                      { name: "Purple", code: "#9B59B6" },
                                      { name: "Orange", code: "#FF851B" }
                                    ];
                                  } else if (value === "fashion") {
                                    newColors = [
                                      { name: "Navy", code: "#001F3F" },
                                      { name: "Maroon", code: "#800000" },
                                      { name: "Olive", code: "#808000" },
                                      { name: "Teal", code: "#008080" },
                                      { name: "Coral", code: "#FF7F50" }
                                    ];
                                  }
                                  
                                  if (newColors.length > 0) {
                                    const existingNames = colors.map(c => c.name.toLowerCase());
                                    const colorsToAdd = newColors
                                      .filter(c => !existingNames.includes(c.name.toLowerCase()))
                                      .map(c => ({ ...c, images: [], price: "", discount_price: "", stock: "100" }));
                                    
                                    if (colorsToAdd.length > 0) {
                                      setColors(prev => {
                                        const filtered = prev.filter(c => c.name.trim() !== "");
                                        return [...filtered, ...colorsToAdd];
                                      });
                                      toast.success(`${colorsToAdd.length} colors added!`);
                                    } else {
                                      toast.info("All these colors already exist");
                                    }
                                  }
                                }}>
                                  <SelectTrigger className="w-[160px] h-9 text-sm">
                                    <SelectValue placeholder="+ Bulk Colors" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">Basic Colors</SelectItem>
                                    <SelectItem value="neutral">Neutral Colors</SelectItem>
                                    <SelectItem value="kids">Kids Colors</SelectItem>
                                    <SelectItem value="fashion">Fashion Colors</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="sm" onClick={addColor}>
                                  <Plus className="w-4 h-4 mr-1" /> Add Color
                                </Button>
                                {colors.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm("Clear all colors?")) {
                                        setColors([{ name: "", code: "#000000", images: [], price: "", discount_price: "", stock: "100" }]);
                                      }
                                    }}
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" /> Clear All
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {colors.map((color, index) => (
                              <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-4">
                                {/* Color Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
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
                                      className="w-48"
                                    />
                                  </div>
                                  {colors.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeColor(index)}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>

                                {/* Color Images */}
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">
                                    Images for {color.name || `Color ${index + 1}`}
                                  </Label>
                                  <div className="flex flex-wrap gap-3">
                                    {color.images.map((img, imgIndex) => (
                                      <div key={imgIndex} className="relative group w-20 h-20">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg border" />
                                        <button
                                          type="button"
                                          onClick={() => removeColorImage(index, imgIndex)}
                                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                                      {imageUploading && currentColorImageUpload === index ? (
                                        <div className="w-5 h-5 border-2 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <>
                                          <Plus className="w-5 h-5 text-gray-400" />
                                          <span className="text-[10px] text-gray-400">Add</span>
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                          setCurrentColorImageUpload(index);
                                          handleImageUpload(e);
                                        }}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>

                                {/* Color Pricing */}
                                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                                  <div>
                                    <Label className="text-xs">Price (Rs.)</Label>
                                    <Input
                                      type="number"
                                      value={color.price}
                                      onChange={(e) => updateColor(index, "price", e.target.value)}
                                      placeholder="0"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Discount Price (Rs.)</Label>
                                    <Input
                                      type="number"
                                      value={color.discount_price}
                                      onChange={(e) => updateColor(index, "discount_price", e.target.value)}
                                      placeholder="Optional"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Stock</Label>
                                    <Input
                                      type="number"
                                      value={color.stock}
                                      onChange={(e) => updateColor(index, "stock", e.target.value)}
                                      placeholder="100"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Sizes Section with Stock */}
                        {variationTypes.sizes && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-medium text-lg">Size Variations</h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Bulk Add Dropdown */}
                                <Select onValueChange={(value) => {
                                  let newSizes = [];
                                  if (value === "clothing_letters") {
                                    newSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
                                  } else if (value === "clothing_numbers") {
                                    newSizes = ["28", "30", "32", "34", "36", "38", "40", "42"];
                                  } else if (value === "kids_ages") {
                                    newSizes = ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"];
                                  } else if (value === "kids_numbers") {
                                    newSizes = ["2", "4", "6", "8", "10", "12", "14", "16"];
                                  } else if (value === "shoes_kids") {
                                    newSizes = ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
                                  } else if (value === "shoes_adult") {
                                    newSizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
                                  } else if (value === "shoes_us") {
                                    newSizes = ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"];
                                  } else if (value === "one_size") {
                                    newSizes = ["One Size", "Free Size"];
                                  }
                                  
                                  if (newSizes.length > 0) {
                                    const existingNames = sizes.map(s => s.name.toLowerCase());
                                    const sizesToAdd = newSizes
                                      .filter(s => !existingNames.includes(s.toLowerCase()))
                                      .map(s => ({ name: s, stock: "100" }));
                                    
                                    if (sizesToAdd.length > 0) {
                                      setSizes(prev => {
                                        const filtered = prev.filter(s => s.name.trim() !== "");
                                        return [...filtered, ...sizesToAdd];
                                      });
                                      toast.success(`${sizesToAdd.length} sizes added!`);
                                    } else {
                                      toast.info("All these sizes already exist");
                                    }
                                  }
                                }}>
                                  <SelectTrigger className="w-[180px] h-9 text-sm" data-testid="bulk-add-sizes-select">
                                    <SelectValue placeholder="+ Bulk Add Sizes" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="clothing_letters">Clothing (XS-3XL)</SelectItem>
                                    <SelectItem value="clothing_numbers">Clothing (28-42)</SelectItem>
                                    <SelectItem value="kids_ages">Kids Age (0-6M to 7-8Y)</SelectItem>
                                    <SelectItem value="kids_numbers">Kids Size (2-16)</SelectItem>
                                    <SelectItem value="shoes_kids">Kids Shoes (20-30)</SelectItem>
                                    <SelectItem value="shoes_adult">Adult Shoes EU (36-45)</SelectItem>
                                    <SelectItem value="shoes_us">Adult Shoes US (6-11)</SelectItem>
                                    <SelectItem value="one_size">One Size / Free Size</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setShowCustomBulkInput(!showCustomBulkInput)}
                                  className={showCustomBulkInput ? "bg-[#FF8FAB]/10 border-[#FF8FAB] text-[#FF8FAB]" : ""}
                                  data-testid="custom-bulk-btn"
                                >
                                  <Plus className="w-4 h-4 mr-1" /> Custom Bulk
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={addSize} data-testid="add-single-size-btn">
                                  <Plus className="w-4 h-4 mr-1" /> Add Size
                                </Button>
                                {sizes.length > 1 && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      if (window.confirm("Clear all sizes?")) {
                                        setSizes([{ name: "", stock: "100" }]);
                                      }
                                    }}
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                    data-testid="clear-all-sizes-btn"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" /> Clear All
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Custom Bulk Add Input */}
                            {showCustomBulkInput && (
                              <div className="bg-[#FF8FAB]/5 border-2 border-[#FF8FAB]/30 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-[#FF8FAB]">Custom Bulk Add Sizes</h5>
                                  <button
                                    type="button"
                                    onClick={() => setShowCustomBulkInput(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Enter sizes separated by comma (,) or new line. Example: S, M, L, XL or 32, 34, 36
                                </p>
                                <textarea
                                  value={customBulkSizes}
                                  onChange={(e) => setCustomBulkSizes(e.target.value)}
                                  placeholder="Enter sizes here...&#10;Example: XS, S, M, L, XL&#10;or&#10;28&#10;30&#10;32&#10;34"
                                  className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF8FAB] focus:border-transparent"
                                  data-testid="custom-bulk-textarea"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      // Parse sizes from input (comma or newline separated)
                                      const inputSizes = customBulkSizes
                                        .split(/[,\n]/)
                                        .map(s => s.trim())
                                        .filter(s => s.length > 0);
                                      
                                      if (inputSizes.length === 0) {
                                        toast.error("Please enter at least one size");
                                        return;
                                      }
                                      
                                      const existingNames = sizes.map(s => s.name.toLowerCase());
                                      const sizesToAdd = inputSizes
                                        .filter(s => !existingNames.includes(s.toLowerCase()))
                                        .map(s => ({ name: s, stock: "100" }));
                                      
                                      if (sizesToAdd.length > 0) {
                                        setSizes(prev => {
                                          const filtered = prev.filter(s => s.name.trim() !== "");
                                          return [...filtered, ...sizesToAdd];
                                        });
                                        toast.success(`${sizesToAdd.length} sizes added!`);
                                        setCustomBulkSizes("");
                                        setShowCustomBulkInput(false);
                                      } else {
                                        toast.info("All these sizes already exist");
                                      }
                                    }}
                                    className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
                                    data-testid="add-custom-bulk-btn"
                                  >
                                    <Plus className="w-4 h-4 mr-1" /> Add All Sizes
                                  </Button>
                                  <span className="text-xs text-gray-400">
                                    {customBulkSizes.split(/[,\n]/).filter(s => s.trim()).length} sizes detected
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 font-medium text-sm text-gray-600">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">Size Name</div>
                                <div className="col-span-2">Price (Rs.)</div>
                                <div className="col-span-2">Stock</div>
                                <div className="col-span-4">Actions</div>
                              </div>
                              
                              {sizes.map((size, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 border-t items-center hover:bg-gray-100/50">
                                  <div className="col-span-1 text-gray-400 font-medium">
                                    {index + 1}
                                  </div>
                                  <div className="col-span-3">
                                    <Input
                                      value={size.name}
                                      onChange={(e) => updateSize(index, "name", e.target.value)}
                                      placeholder="e.g., 34, M, XL"
                                      className="w-full"
                                      data-testid={`size-name-input-${index}`}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="number"
                                      value={size.price || ""}
                                      onChange={(e) => updateSize(index, "price", e.target.value)}
                                      placeholder="0"
                                      className="w-full"
                                      data-testid={`size-price-input-${index}`}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="number"
                                      value={size.stock}
                                      onChange={(e) => updateSize(index, "stock", e.target.value)}
                                      placeholder="100"
                                      className="w-full"
                                      data-testid={`size-stock-input-${index}`}
                                    />
                                  </div>
                                  <div className="col-span-4 flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        // Move up
                                        if (index > 0) {
                                          setSizes(prev => {
                                            const newSizes = [...prev];
                                            [newSizes[index - 1], newSizes[index]] = [newSizes[index], newSizes[index - 1]];
                                            return newSizes;
                                          });
                                        }
                                      }}
                                      disabled={index === 0}
                                      className="p-1 h-8 w-8"
                                      title="Move Up"
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        // Move down
                                        if (index < sizes.length - 1) {
                                          setSizes(prev => {
                                            const newSizes = [...prev];
                                            [newSizes[index], newSizes[index + 1]] = [newSizes[index + 1], newSizes[index]];
                                            return newSizes;
                                          });
                                        }
                                      }}
                                      disabled={index === sizes.length - 1}
                                      className="p-1 h-8 w-8"
                                      title="Move Down"
                                    >
                                      ↓
                                    </Button>
                                    {sizes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeSize(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        title="Delete Size"
                                        data-testid={`delete-size-${index}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Quick Info */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Total: <strong className="text-gray-700">{sizes.filter(s => s.name.trim()).length}</strong> sizes</span>
                              <span>Total Stock: <strong className="text-gray-700">{sizes.reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0)}</strong> units</span>
                            </div>
                          </div>
                        )}

                        {/* Combined Variations Matrix - EDITABLE */}
                        {variationTypes.colors && variationTypes.sizes && colors.filter(c => c.name.trim()).length > 0 && sizes.filter(s => s.name.trim()).length > 0 && (
                          <div className="bg-gradient-to-r from-[#FF8FAB]/5 to-[#4CC9F0]/5 border-2 border-[#FF8FAB]/20 rounded-xl p-4 space-y-4" data-testid="combined-variations-matrix">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-medium text-lg flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-[#FF8FAB]/20 flex items-center justify-center">🎨</span>
                                Combined Variations Matrix
                                <span className="text-xs bg-[#FF8FAB] text-white px-2 py-1 rounded-full">EDITABLE</span>
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {combinedVariations.length} combinations
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={applyPriceToAll}
                                  className="text-[#FF8FAB] border-[#FF8FAB]/30 hover:bg-[#FF8FAB]/10"
                                  data-testid="apply-price-all-btn"
                                >
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Apply Base Price to All
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-500">
                              ✏️ Set individual <strong>Price, Discount Price, and Stock</strong> for each Color × Size combination below.
                            </p>
                            
                            {/* Matrix Table - EDITABLE */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm" data-testid="variations-matrix-table">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-3 py-2 text-left font-medium text-gray-600">Color</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600">Size</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 min-w-[120px]">Price (Rs.) *</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 min-w-[120px]">Discount Price</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 min-w-[100px]">Stock</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600">SKU</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {combinedVariations.map((variation, idx) => {
                                    const colorData = colors.find(c => c.name === variation.color);
                                    return (
                                      <tr key={`${variation.color}-${variation.size}`} className="border-t hover:bg-gray-50/50" data-testid={`variation-row-${idx}`}>
                                        <td className="px-3 py-2">
                                          <div className="flex items-center gap-2">
                                            <span 
                                              className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
                                              style={{ backgroundColor: colorData?.code || '#000' }}
                                            ></span>
                                            <span className="font-medium">{variation.color}</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2">
                                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">{variation.size}</span>
                                        </td>
                                        <td className="px-3 py-2">
                                          <Input
                                            type="number"
                                            value={variation.price}
                                            onChange={(e) => updateCombinedVariation(variation.color, variation.size, 'price', e.target.value)}
                                            placeholder="0"
                                            className="h-8 w-full"
                                            data-testid={`variation-price-${idx}`}
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Input
                                            type="number"
                                            value={variation.discount_price}
                                            onChange={(e) => updateCombinedVariation(variation.color, variation.size, 'discount_price', e.target.value)}
                                            placeholder="Optional"
                                            className="h-8 w-full"
                                            data-testid={`variation-discount-${idx}`}
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <Input
                                            type="number"
                                            value={variation.stock}
                                            onChange={(e) => updateCombinedVariation(variation.color, variation.size, 'stock', e.target.value)}
                                            placeholder="100"
                                            className="h-8 w-full"
                                            data-testid={`variation-stock-${idx}`}
                                          />
                                        </td>
                                        <td className="px-3 py-2">
                                          <code className="text-xs bg-gray-100 px-2 py-1 rounded block truncate max-w-[120px]" title={variation.sku}>
                                            {variation.sku || 'Auto'}
                                          </code>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            {/* Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/50 rounded-lg p-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-[#FF8FAB]">{combinedVariations.length}</div>
                                <div className="text-xs text-gray-500">Total Variants</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {combinedVariations.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}
                                </div>
                                <div className="text-xs text-gray-500">Total Stock</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  Rs. {Math.min(...combinedVariations.map(v => parseFloat(v.price) || 0).filter(p => p > 0)) || 0}
                                </div>
                                <div className="text-xs text-gray-500">Lowest Price</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  Rs. {Math.max(...combinedVariations.map(v => parseFloat(v.price) || 0)) || 0}
                                </div>
                                <div className="text-xs text-gray-500">Highest Price</div>
                              </div>
                            </div>
                            
                            <div className="bg-white/50 rounded-lg p-3 text-sm text-gray-600">
                              <strong>💡 Tip:</strong> You can set different prices for each size of a color. For example, larger sizes can have higher prices.
                            </div>
                          </div>
                        )}

                        {/* Info Box */}
                        {(variationTypes.colors || variationTypes.sizes) && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <h4 className="font-medium text-yellow-800 mb-2">💡 Tip</h4>
                            <p className="text-sm text-yellow-700">
                              Each color+size combination will have its own price and stock. 
                              When customer selects a variation, the price and stock will update automatically.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="space-y-6">
                  {/* Main Description with Rich Text Editor */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Product Description <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2" data-testid="product-description-editor">
                      <SimpleRichEditor
                        value={formData.description}
                        onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                        placeholder="Describe your product in detail... Select text and click B to bold"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.description.replace(/<[^>]*>/g, '').length} characters
                    </p>
                  </div>

                  {/* Stylish Words Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Stylish Words
                        </h4>
                        <p className="text-sm text-gray-500">Add words that will appear with playful random styling</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStylishSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          stylishSettings.enabled ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                          stylishSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {stylishSettings.enabled && (
                      <>
                        {/* Intensity & Preset */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs mb-1 block">Intensity</Label>
                            <div className="flex gap-2">
                              {["low", "medium", "high"].map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => setStylishSettings(prev => ({ ...prev, intensity: level }))}
                                  className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${
                                    stylishSettings.intensity === level
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-white border hover:bg-purple-50'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Style</Label>
                            <div className="flex gap-2">
                              {["playful", "rainbow", "subtle"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setStylishSettings(prev => ({ ...prev, preset }))}
                                  className={`flex-1 py-2 text-xs rounded-lg capitalize transition-all ${
                                    stylishSettings.preset === preset
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-white border hover:bg-purple-50'
                                  }`}
                                >
                                  {preset === "playful" && "🎨 "}
                                  {preset === "rainbow" && "🌈 "}
                                  {preset === "subtle" && "✨ "}
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Add Words */}
                        <div className="flex gap-2 mb-3">
                          <Input
                            value={newStylishWord}
                            onChange={(e) => setNewStylishWord(e.target.value)}
                            placeholder="Type a word to make stylish..."
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newStylishWord.trim()) {
                                e.preventDefault();
                                setStylishWords(prev => [...prev, newStylishWord.trim()]);
                                setNewStylishWord("");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (newStylishWord.trim()) {
                                setStylishWords(prev => [...prev, newStylishWord.trim()]);
                                setNewStylishWord("");
                              }
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Word Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {stylishWords.map((word, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-purple-200 rounded-full text-sm"
                            >
                              <StylishText 
                                text={word} 
                                enabled={true}
                                intensity={stylishSettings.intensity}
                                colors={
                                  stylishSettings.preset === "playful" ? ["#FF8FAB", "#FFD166", "#4ECDC4", "#9B59B6"] :
                                  stylishSettings.preset === "rainbow" ? ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1"] :
                                  ["#FF8FAB", "#4ECDC4"]
                                }
                              />
                              <button
                                type="button"
                                onClick={() => setStylishWords(prev => prev.filter((_, i) => i !== index))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          {stylishWords.length === 0 && (
                            <span className="text-sm text-gray-400 italic">No stylish words added yet</span>
                          )}
                        </div>
                        
                        {/* Preview */}
                        {stylishWords.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border">
                            <Label className="text-xs text-gray-500 mb-2 block">Preview:</Label>
                            <p className="text-lg">
                              This product features{" "}
                              {stylishWords.map((word, i) => (
                                <span key={i}>
                                  <StylishText 
                                    text={word} 
                                    enabled={true}
                                    intensity={stylishSettings.intensity}
                                    colors={
                                      stylishSettings.preset === "playful" ? ["#FF8FAB", "#FFD166", "#4ECDC4", "#9B59B6"] :
                                      stylishSettings.preset === "rainbow" ? ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1"] :
                                      ["#FF8FAB", "#4ECDC4"]
                                    }
                                  />
                                  {i < stylishWords.length - 1 ? ", " : ""}
                                </span>
                              ))}
                              {" "}and more!
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Product Highlights / Key Features */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <List className="w-5 h-5 text-[#FF8FAB]" />
                        Product Highlights
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setHighlights(prev => [...prev, { text: "", bold: false }])}
                        data-testid="add-highlight-btn"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Point
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Add key features as bullet points (shown on product page)</p>
                    <div className="space-y-2">
                      {highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[#FF8FAB] font-bold">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newHighlights = [...highlights];
                              if (typeof newHighlights[index] === 'string') {
                                newHighlights[index] = { text: newHighlights[index], bold: true };
                              } else {
                                newHighlights[index] = { ...newHighlights[index], bold: !newHighlights[index].bold };
                              }
                              setHighlights(newHighlights);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                              (typeof highlight === 'object' && highlight.bold) 
                                ? 'bg-[#FF8FAB] text-white border-[#FF8FAB]' 
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                            title="Toggle Bold"
                          >
                            B
                          </button>
                          <Input
                            value={typeof highlight === 'string' ? highlight : highlight.text}
                            onChange={(e) => {
                              const newHighlights = [...highlights];
                              if (typeof newHighlights[index] === 'string') {
                                newHighlights[index] = e.target.value;
                              } else {
                                newHighlights[index] = { ...newHighlights[index], text: e.target.value };
                              }
                              setHighlights(newHighlights);
                            }}
                            placeholder={`Feature ${index + 1}, e.g., "100% Cotton Material"`}
                            className={`flex-1 ${(typeof highlight === 'object' && highlight.bold) ? 'font-bold' : ''}`}
                            data-testid={`highlight-input-${index}`}
                          />
                          {highlights.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHighlights(prev => prev.filter((_, i) => i !== index))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What's in the Box */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#4CC9F0]" />
                        What&apos;s in the Box
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setWhatsInBox(prev => [...prev, ""])}
                        data-testid="add-box-item-btn"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">List all items included in the package</p>
                    <div className="space-y-2">
                      {whatsInBox.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[#4CC9F0] font-bold">{index + 1}.</span>
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...whatsInBox];
                              newItems[index] = e.target.value;
                              setWhatsInBox(newItems);
                            }}
                            placeholder={`Item ${index + 1}, e.g., "1x T-Shirt", "Gift Box"`}
                            className="flex-1"
                            data-testid={`box-item-input-${index}`}
                          />
                          {whatsInBox.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setWhatsInBox(prev => prev.filter((_, i) => i !== index))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Specifications */}
                  <div className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#FFD166]" />
                        Specifications
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSpecifications(prev => [...prev, { text: "", bold: false }])}
                        data-testid="add-spec-btn"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Spec
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Add specifications like dimensions, material, etc.</p>
                    <div className="space-y-2">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[#4ECDC4] font-bold">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = [...specifications];
                              if (typeof newSpecs[index] === 'string') {
                                newSpecs[index] = { text: newSpecs[index], bold: true };
                              } else {
                                newSpecs[index] = { ...newSpecs[index], bold: !newSpecs[index].bold };
                              }
                              setSpecifications(newSpecs);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                              (typeof spec === 'object' && spec.bold) 
                                ? 'bg-[#4ECDC4] text-white border-[#4ECDC4]' 
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                            title="Toggle Bold"
                          >
                            B
                          </button>
                          <Input
                            value={typeof spec === 'string' ? spec : spec.text || ''}
                            onChange={(e) => {
                              const newSpecs = [...specifications];
                              if (typeof newSpecs[index] === 'string') {
                                newSpecs[index] = { text: e.target.value, bold: false };
                              } else {
                                newSpecs[index] = { ...newSpecs[index], text: e.target.value };
                              }
                              setSpecifications(newSpecs);
                            }}
                            placeholder='e.g., 9"W x 6"H x 2.5"D, 100% Cotton, Made in Pakistan'
                            className={`flex-1 ${(typeof spec === 'object' && spec.bold) ? 'font-bold' : ''}`}
                            data-testid={`spec-input-${index}`}
                          />
                          {specifications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSpecifications(prev => prev.filter((_, i) => i !== index))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Product Details */}
                  <div className="bg-white rounded-xl border p-4">
                    <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#FF8FAB]" />
                      Additional Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brand" className="text-sm font-medium">Brand Name</Label>
                        <Input
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          placeholder="e.g., Samsung, Apple, etc."
                          className="mt-2"
                          data-testid="brand-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight" className="text-sm font-medium">Product Weight</Label>
                        <Input
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="e.g., 250g, 1.5kg"
                          className="mt-2"
                          data-testid="weight-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dimensions" className="text-sm font-medium">Dimensions</Label>
                        <Input
                          id="dimensions"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleInputChange}
                          placeholder='e.g., 9"W x 6"H x 2.5"D'
                          className="mt-2"
                          data-testid="dimensions-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="warranty" className="text-sm font-medium">Returns (Days)</Label>
                        <select
                          id="warranty"
                          name="warranty"
                          value={formData.warranty}
                          onChange={handleInputChange}
                          className="mt-2 w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8FAB] focus:border-transparent"
                          data-testid="warranty-input"
                        >
                          <option value="">Select return days</option>
                          {[...Array(100)].map((_, i) => (
                            <option key={i + 1} value={`${i + 1} Days`}>{i + 1} Days</option>
                          ))}
                          <option value="No Returns">No Returns</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Custom Attributes Section */}
                  {customAttributes.length > 0 && (
                    <div className="bg-white rounded-xl border p-4">
                      <h4 className="font-medium text-lg flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-[#FF8FAB]" />
                        Custom Attributes
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">Fill in custom fields added by admin</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customAttributes.map((attr) => (
                          <div key={attr.id}>
                            <Label className="text-sm font-medium">
                              {attr.name} {attr.required && <span className="text-red-500">*</span>}
                            </Label>
                            {attr.type === "select" ? (
                              <select
                                value={customAttributeValues[attr.id] || ""}
                                onChange={(e) => setCustomAttributeValues(prev => ({...prev, [attr.id]: e.target.value}))}
                                className="w-full mt-2 px-3 py-2 border rounded-lg"
                                required={attr.required}
                              >
                                <option value="">Select {attr.name}</option>
                                {attr.options?.map((opt, idx) => (
                                  <option key={idx} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                type={attr.type === "number" ? "number" : "text"}
                                value={customAttributeValues[attr.id] || ""}
                                onChange={(e) => setCustomAttributeValues(prev => ({...prev, [attr.id]: e.target.value}))}
                                placeholder={`Enter ${attr.name}`}
                                className="mt-2"
                                required={attr.required}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">💡 Tips for great description</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Be specific about size, color, material</li>
                      <li>• Use bullet points for easy reading</li>
                      <li>• Mention what makes your product unique</li>
                      <li>• Include care and usage instructions</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Shipping Tab */}
              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Package Dimensions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="package_weight" className="text-sm">Weight (kg)</Label>
                        <Input
                          id="package_weight"
                          value={shippingData.package_weight}
                          onChange={(e) => setShippingData(prev => ({...prev, package_weight: e.target.value}))}
                          placeholder="0.5"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_length" className="text-sm">Length (cm)</Label>
                        <Input
                          id="package_length"
                          value={shippingData.package_length}
                          onChange={(e) => setShippingData(prev => ({...prev, package_length: e.target.value}))}
                          placeholder="20"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_width" className="text-sm">Width (cm)</Label>
                        <Input
                          id="package_width"
                          value={shippingData.package_width}
                          onChange={(e) => setShippingData(prev => ({...prev, package_width: e.target.value}))}
                          placeholder="15"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_height" className="text-sm">Height (cm)</Label>
                        <Input
                          id="package_height"
                          value={shippingData.package_height}
                          onChange={(e) => setShippingData(prev => ({...prev, package_height: e.target.value}))}
                          placeholder="5"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="dangerous_goods"
                      checked={shippingData.dangerous_goods}
                      onChange={(e) => setShippingData(prev => ({...prev, dangerous_goods: e.target.checked}))}
                      className="w-5 h-5 rounded border-gray-300 text-[#FF8FAB] focus:ring-[#FF8FAB]"
                    />
                    <label htmlFor="dangerous_goods" className="text-sm font-medium cursor-pointer">
                      This product contains dangerous goods (batteries, liquids, etc.)
                    </label>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-medium text-green-800 mb-2">📦 Shipping Information</h4>
                    <p className="text-sm text-green-700">
                      Shipping rates are calculated based on package dimensions and destination. 
                      Accurate measurements help ensure correct shipping costs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 lg:left-64">
            <Button variant="outline" onClick={() => navigate("/admin/products")} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-lg px-8"
            >
              {saving ? "Saving..." : (isEditing ? "Update Product" : "Publish Product")}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
