import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/Layout";
import AdminSidebar from "../../components/AdminSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, ExternalLink, Copy, Check, X, CheckSquare, Square } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    icon: "📦",
    image_url: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_price: "",
    category: "clothes",
    image_urls: [],
    stock: "100",
    sizes: "",
    colors: "",
    ages: "",
    is_sold_out: false
  });

  // Bulk entry state - multiple products at once
  const [bulkProducts, setBulkProducts] = useState([
    { name: "", price: "", category: "clothes", description: "", image_url: "", stock: "100" }
  ]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Category image upload handler
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCategoryImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setCategoryImagePreview(base64);
      
      try {
        const response = await axios.post(`${API}/upload/image`, { image: base64 });
        setCategoryFormData({ ...categoryFormData, image_url: `${BACKEND_URL}${response.data.image_url}` });
        toast.success("Image uploaded!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Image upload failed");
      } finally {
        setCategoryImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Category submit handler
  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/admin/categories`, categoryFormData);
      toast.success("Category added!");
      setCategoryDialogOpen(false);
      setCategoryFormData({ name: "", icon: "📦", image_url: "" });
      setCategoryImagePreview(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.detail || "Something went wrong");
    }
  };

  // Duplicate product handler
  const handleDuplicateProduct = async (product) => {
    try {
      const token = localStorage.getItem("token");
      
      // Create duplicate product data
      const duplicateData = {
        name: `Copy of ${product.name}`,
        description: product.description || "",
        price: product.price,
        discount_price: product.discount_price || null,
        category: product.category,
        image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
        stock: product.stock || 100,
        sizes: product.sizes || [],
        colors: product.colors || [],
        ages: product.ages || "",
        brand: product.brand || "",
        weight: product.weight || "",
        warranty: product.warranty || "",
        highlights: product.highlights || [],
        whats_in_box: product.whats_in_box || [],
        specifications: product.specifications || [],
        variations: product.variations || [],
        custom_attributes: product.custom_attributes || {}
      };

      const response = await axios.post(`${API}/admin/products`, duplicateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Product duplicated! New ID: ${response.data.product_id}`);
      fetchProducts();
      
      // Option: Navigate to edit the duplicated product
      // navigate(`/admin/products/edit/${response.data.product_id}`);
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error(error.response?.data?.detail || "Failed to duplicate product");
    }
  };

  const categoryEmojis = ["📦", "👕", "🧸", "📚", "🎮", "🎨", "⚽", "🎁", "👶", "🧒", "👗", "👟"];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discount_price: "",
      category: "clothes",
      image_urls: [],
      stock: "100",
      sizes: "",
      colors: "",
      ages: "",
      is_sold_out: false
    });
    setEditingProduct(null);
    setImagePreviews([]);
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
          
          setImagePreviews(prev => [...prev, base64]);
          setFormData(prev => ({
            ...prev,
            image_urls: [...prev.image_urls, imageUrl]
          }));
          toast.success("Image uploaded!");
        } catch (error) {
          console.error("Upload error:", error);
          toast.error("Image upload failed");
        }
      };
      reader.readAsDataURL(file);
    }
    
    setImageUploading(false);
  };

  // Remove image
  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Handle both old single image and new multiple images format
    const imageUrls = product.image_urls || (product.image_url ? [product.image_url] : []);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount_price: product.discount_price ? product.discount_price.toString() : "",
      category: product.category,
      image_urls: imageUrls,
      stock: product.stock.toString(),
      sizes: product.sizes ? product.sizes.join(", ") : "",
      colors: product.colors ? product.colors.join(", ") : "",
      ages: product.ages || "",
      is_sold_out: product.is_sold_out || false
    });
    setImagePreviews(imageUrls);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      category: formData.category,
      image_url: formData.image_urls.length > 0 ? formData.image_urls[0] : "",
      image_urls: formData.image_urls,
      stock: parseInt(formData.stock),
      sizes: formData.sizes ? formData.sizes.split(",").map(s => s.trim()) : null,
      colors: formData.colors ? formData.colors.split(",").map(c => c.trim()) : null,
      ages: formData.ages || null,
      is_sold_out: formData.is_sold_out
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.product_id}`, productData);
        toast.success("Product updated");
      } else {
        await axios.post(`${API}/products`, productData);
        toast.success("Product added");
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API}/products/${productId}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Something went wrong");
    }
  };

  // Stock update functions
  const handleStockEdit = (productId, currentStock) => {
    setEditingStock(productId);
    setStockValue(currentStock.toString());
  };

  const handleStockSave = async (productId) => {
    try {
      await axios.patch(`${API}/products/${productId}/stock`, { stock: parseInt(stockValue) });
      toast.success("Stock updated!");
      setEditingStock(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock");
    }
  };

  const handleStockCancel = () => {
    setEditingStock(null);
    setStockValue("");
  };

  // Selection functions
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.product_id)));
    }
  };

  const toggleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      toast.error("No products selected");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)?`)) return;

    let successCount = 0;
    let errorCount = 0;

    for (const productId of selectedProducts) {
      try {
        await axios.delete(`${API}/products/${productId}`);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} product(s) deleted!`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} product(s) failed to delete`);
    }

    setSelectedProducts(new Set());
    fetchProducts();
  };

  // Bulk product functions
  const addBulkRow = () => {
    setBulkProducts([...bulkProducts, { name: "", price: "", category: "clothes", description: "", image_url: "", stock: "100" }]);
  };

  const removeBulkRow = (index) => {
    if (bulkProducts.length > 1) {
      setBulkProducts(bulkProducts.filter((_, i) => i !== index));
    }
  };

  const updateBulkProduct = (index, field, value) => {
    const updated = [...bulkProducts];
    updated[index][field] = value;
    setBulkProducts(updated);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkSaving(true);

    let successCount = 0;
    let errorCount = 0;

    for (const product of bulkProducts) {
      if (!product.name || !product.price) continue;

      try {
        const productData = {
          name: product.name,
          description: product.description || `${product.name} - Quality product for kids`,
          price: parseFloat(product.price),
          category: product.category,
          image_url: product.image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400",
          stock: parseInt(product.stock) || 100,
          sizes: null,
          ages: null
        };

        await axios.post(`${API}/products`, productData);
        successCount++;
      } catch (error) {
        console.error("Error adding product:", error);
        errorCount++;
      }
    }

    setBulkSaving(false);

    if (successCount > 0) {
      toast.success(`${successCount} products added successfully!`);
      setBulkProducts([{ name: "", price: "", category: "clothes", description: "", image_url: "", stock: "100" }]);
      setBulkDialogOpen(false);
      fetchProducts();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} products failed to add`);
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A]" data-testid="products-title">
              Products Management
            </h1>

            <div className="flex gap-3 flex-wrap">
              {/* Single Product Add Button - Links to Daraz-style page */}
              <Link to="/admin/products/new">
                <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full" data-testid="add-product-btn">
                  <Plus className="w-5 h-5 mr-2" />
                  New Product
                </Button>
              </Link>
            </div>
          </div>

          {/* Action Buttons Row - Select All & Delete Selected */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-xl border border-gray-200">
            {/* Select All Button */}
            <Button
              onClick={toggleSelectAll}
              variant="outline"
              className={`rounded-full ${selectedProducts.size === products.length && products.length > 0 ? 'bg-[#FF8FAB]/10 border-[#FF8FAB] text-[#FF8FAB]' : ''}`}
              data-testid="select-all-btn"
            >
              {selectedProducts.size === products.length && products.length > 0 ? (
                <CheckSquare className="w-5 h-5 mr-2" />
              ) : (
                <Square className="w-5 h-5 mr-2" />
              )}
              Select All
            </Button>

            {/* Delete Selected Button - Always visible but disabled when nothing selected */}
            <Button 
              onClick={handleDeleteSelected}
              disabled={selectedProducts.size === 0}
              className={`rounded-full ${selectedProducts.size > 0 ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              data-testid="delete-selected-btn"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Selected {selectedProducts.size > 0 && `(${selectedProducts.size})`}
            </Button>

            {/* Selected count info */}
            {selectedProducts.size > 0 && (
              <span className="text-sm text-[#6B7280]">
                {selectedProducts.size} of {products.length} selected
              </span>
            )}
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="bg-white rounded-2xl p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 h-20 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden" data-testid="products-table">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-4 w-12"></th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Product</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Category</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Price</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Stock</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[#6B7280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.product_id} className={`hover:bg-gray-50 ${selectedProducts.has(product.product_id) ? 'bg-[#FF8FAB]/5' : ''}`}>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleSelectProduct(product.product_id)}
                            className="p-1"
                            data-testid={`select-${product.product_id}`}
                          >
                            {selectedProducts.has(product.product_id) ? (
                              <CheckSquare className="w-5 h-5 text-[#FF8FAB]" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <span className="font-medium text-[#1A1A1A]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#6B7280]">
                          {(() => {
                            const cat = categories.find(c => (c.category_id || c.id) === product.category);
                            return cat ? cat.name : product.category;
                          })()}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#FF8FAB]">
                          Rs. {typeof product.price === 'number' ? product.price.toFixed(0) : product.price}
                        </td>
                        <td className="px-6 py-4">
                          {editingStock === product.product_id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={stockValue}
                                onChange={(e) => setStockValue(e.target.value)}
                                className="w-24 h-9 text-sm border-2 border-[#FF8FAB]"
                                min="0"
                                autoFocus
                                data-testid={`stock-input-${product.product_id}`}
                              />
                              <button
                                onClick={() => handleStockSave(product.product_id)}
                                className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-lg"
                                data-testid={`stock-save-${product.product_id}`}
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleStockCancel}
                                className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg"
                                data-testid={`stock-cancel-${product.product_id}`}
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.stock < 10 ? "bg-red-100 text-red-600" : "bg-[#06D6A0]/10 text-[#06D6A0]"
                              }`}>
                                {product.stock}
                              </span>
                              <button
                                onClick={() => handleStockEdit(product.product_id, product.stock)}
                                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                                title="Update Stock"
                                data-testid={`stock-edit-${product.product_id}`}
                              >
                                Update
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/product/${product.product_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#06D6A0]/10 hover:bg-[#06D6A0]/30 rounded-lg transition-colors text-[#06D6A0] font-medium text-sm"
                              data-testid={`view-${product.product_id}`}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <Link
                              to={`/admin/products/edit/${product.product_id}`}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#FFD166]/10 hover:bg-[#FFD166]/30 rounded-lg transition-colors text-[#B8860B] font-medium text-sm"
                              data-testid={`edit-${product.product_id}`}
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDuplicateProduct(product)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#4ECDC4]/10 hover:bg-[#4ECDC4]/30 rounded-lg transition-colors text-[#4ECDC4] font-medium text-sm"
                              data-testid={`duplicate-${product.product_id}`}
                              title="Duplicate this product"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDelete(product.product_id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-500 font-medium text-sm"
                              data-testid={`delete-${product.product_id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
