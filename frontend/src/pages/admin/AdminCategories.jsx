import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Pencil, Trash2, Image, ChevronRight, ChevronDown, FolderPlus, Tags, Package, Layers, Settings, X, CheckSquare, Square, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [customAttributes, setCustomAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [attrDialogOpen, setAttrDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeSection, setActiveSection] = useState("categories"); // categories or attributes
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    name: "",
    icon: "📦",
    image_url: "",
    parent_id: null // null means it's a main category
  });
  const [attrFormData, setAttrFormData] = useState({
    name: "",
    type: "text",
    options: "",
    required: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
      // Auto-expand main categories
      const mainCats = response.data.filter(c => !c.parent_id);
      setExpandedCategories(new Set(mainCats.map(c => c.category_id || c.id)));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchCategories();
    fetchCustomAttributes();
  }, []);

  // Get main categories (no parent - handles null, undefined, empty string)
  const mainCategories = categories.filter(c => !c.parent_id && c.parent_id !== "");
  
  // Get direct children of a parent
  const getChildren = (parentId) => {
    return categories.filter(c => c.parent_id === parentId);
  };

  // Get all descendants count (recursive)
  const getAllDescendantsCount = (categoryId) => {
    const directChildren = getChildren(categoryId);
    let count = directChildren.length;
    directChildren.forEach(child => {
      count += getAllDescendantsCount(child.category_id || child.id);
    });
    return count;
  };

  // Get total product count including all subcategories
  const getTotalProductCount = (categoryId) => {
    const cat = categories.find(c => (c.category_id || c.id) === categoryId);
    let count = cat?.product_count || 0;
    
    const children = getChildren(categoryId);
    children.forEach(child => {
      count += getTotalProductCount(child.category_id || child.id);
    });
    return count;
  };

  // Toggle expand/collapse
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Get all categories that can be parents (for dropdown)
  const getAllPotentialParents = (excludeId = null) => {
    // Return all categories except the one being edited and its children
    const getDescendantIds = (catId) => {
      const children = getChildren(catId);
      let ids = [catId];
      children.forEach(child => {
        ids = [...ids, ...getDescendantIds(child.category_id || child.id)];
      });
      return ids;
    };

    const excludeIds = excludeId ? getDescendantIds(excludeId) : [];
    return categories.filter(c => !excludeIds.includes(c.category_id || c.id));
  };

  // Get depth/level of a category
  const getCategoryDepth = (categoryId, depth = 0) => {
    const cat = categories.find(c => (c.category_id || c.id) === categoryId);
    if (!cat || !cat.parent_id) return depth;
    return getCategoryDepth(cat.parent_id, depth + 1);
  };

  // Get parent chain for display
  const getParentChain = (categoryId) => {
    const chain = [];
    let currentId = categoryId;
    while (currentId) {
      const cat = categories.find(c => (c.category_id || c.id) === currentId);
      if (cat) {
        chain.unshift(cat);
        currentId = cat.parent_id;
      } else {
        break;
      }
    }
    return chain;
  };

  // Custom Attribute handlers
  const handleCreateAttribute = async () => {
    if (!attrFormData.name.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const options = attrFormData.type === "select" 
        ? attrFormData.options.split(",").map(o => o.trim()).filter(o => o)
        : [];

      await axios.post(`${API}/admin/custom-attributes`, {
        name: attrFormData.name,
        type: attrFormData.type,
        options: options,
        required: attrFormData.required
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Custom attribute created!");
      setAttrDialogOpen(false);
      setAttrFormData({ name: "", type: "text", options: "", required: false });
      fetchCustomAttributes();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create attribute");
    }
  };

  const handleDeleteAttribute = async (attrId) => {
    if (!window.confirm("Are you sure you want to delete this attribute?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/custom-attributes/${attrId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Attribute deleted!");
      fetchCustomAttributes();
    } catch (error) {
      toast.error("Failed to delete attribute");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setImagePreview(base64);
      
      try {
        const response = await axios.post(`${API}/upload/image`, { image: base64 });
        setFormData({ ...formData, image_url: `${BACKEND_URL}${response.data.image_url}` });
        toast.success("Image uploaded!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Image upload failed");
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "📦", image_url: "", parent_id: null });
    setEditingCategory(null);
    setImagePreview(null);
  };

  // Drag and Drop functions for reordering
  const handleDragStart = (e, category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory.category_id === targetCategory.category_id) {
      setDraggedCategory(null);
      return;
    }

    // Only allow reordering among parent categories (same level)
    if (draggedCategory.parent_id !== targetCategory.parent_id) {
      toast.error("Can only reorder categories at the same level");
      setDraggedCategory(null);
      return;
    }

    // Reorder categories
    const parentCategories = categories.filter(c => c.parent_id === draggedCategory.parent_id);
    const draggedIndex = parentCategories.findIndex(c => c.category_id === draggedCategory.category_id);
    const targetIndex = parentCategories.findIndex(c => c.category_id === targetCategory.category_id);

    // Create new order
    const newOrder = [...parentCategories];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCategory);

    // Update positions in database
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/categories/reorder`, {
        category_ids: newOrder.map(c => c.category_id)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category order updated!");
      fetchCategories();
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to update order");
    }

    setDraggedCategory(null);
  };

  // Move category up/down buttons
  const moveCategory = async (category, direction) => {
    const catId = category.category_id || category.id;
    if (!catId) {
      toast.error("Invalid category");
      return;
    }
    
    const parentCategories = categories
      .filter(c => c.parent_id === category.parent_id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    
    const currentIndex = parentCategories.findIndex(c => (c.category_id || c.id) === catId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= parentCategories.length) return;

    // Swap positions
    const newOrder = [...parentCategories];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    // Get valid category IDs only
    const categoryIds = newOrder
      .map(c => c.category_id || c.id)
      .filter(id => id != null && id !== undefined && id !== '');

    if (categoryIds.length === 0) {
      toast.error("No valid categories to reorder");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/categories/reorder`, {
        category_ids: categoryIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category moved!");
      fetchCategories();
    } catch (error) {
      console.error("Move error:", error.response?.data || error);
      toast.error("Failed to move category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || "📦",
      image_url: category.image_url || "",
      parent_id: category.parent_id || null
    });
    setImagePreview(category.image_url);
    setDialogOpen(true);
  };

  const handleAddSubcategory = (parentCategory) => {
    resetForm();
    setFormData({
      name: "",
      icon: parentCategory.icon || "📦",
      image_url: "",
      parent_id: parentCategory.category_id || parentCategory.id
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const payload = {
        name: formData.name,
        icon: formData.icon,
        image_url: formData.image_url,
        parent_id: formData.parent_id || null
      };

      if (editingCategory) {
        await axios.put(`${API}/admin/categories/${editingCategory.category_id || editingCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Category updated! ✅");
      } else {
        await axios.post(`${API}/admin/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(formData.parent_id ? "Subcategory added! ✅" : "Category added! ✅");
      }
      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.detail || "Something went wrong");
    }
  };

  const handleDelete = async (categoryId) => {
    // Check if this category has children
    const hasChildren = categories.some(c => c.parent_id === categoryId);
    if (hasChildren) {
      toast.error("Please delete all subcategories first!");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category deleted! 🗑️");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Something went wrong");
    }
  };

  // Selection functions for categories
  const toggleSelectAllCategories = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map(c => c.category_id || c.id)));
    }
  };

  const toggleSelectCategory = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleDeleteSelectedCategories = async () => {
    if (selectedCategories.size === 0) {
      toast.error("No categories selected");
      return;
    }

    // Check if any selected category has children
    for (const catId of selectedCategories) {
      const hasChildren = categories.some(c => c.parent_id === catId);
      if (hasChildren) {
        const cat = categories.find(c => (c.category_id || c.id) === catId);
        toast.error(`"${cat?.name}" has subcategories. Delete them first!`);
        return;
      }
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.size} category(ies)?`)) return;
    const token = localStorage.getItem("token");

    let successCount = 0;
    let errorCount = 0;

    for (const categoryId of selectedCategories) {
      try {
        await axios.delete(`${API}/admin/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} category(ies) deleted!`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} category(ies) failed to delete`);
    }

    setSelectedCategories(new Set());
    fetchCategories();
  };

  const emojis = [
    "📦", "🏷️", "🛒", "🛍️", "💫", "⭐", "✨", "🔥",
    "👕", "👗", "👔", "👖", "👚", "🧥", "👘", "👙", "🩱", "👜", "👛", "👝", "🎒", "👞", "👟", "🥿", "👠", "👡", "👢", "🧢", "👒", "🎩", "⌚", "💍", "💎", "🕶️", "👓", "🧣", "🧤", "🧦",
    "👶", "🧒", "🍼", "👧", "👦",
    "🧸", "🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🃏", "🧩", "🪀", "🪁",
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥊", "🥋", "🚴", "🏃",
    "📱", "💻", "🖥️", "⌨️", "🖱️", "🎧", "🎤", "📷", "📹", "📺", "📻", "🔌", "💡",
    "🏠", "🛋️", "🛏️", "🪑", "🚿", "🛁", "🧴", "🧹", "🍳", "🍴", "☕",
    "📚", "📖", "📝", "✏️", "🖍️", "📐", "🔬", "🧪", "🌍",
    "🍎", "🍕", "🍔", "🥗", "🍰", "🍫",
    "💄", "💅", "🩺", "💊",
    "🚗", "🏍️", "🚲",
    "🎁", "🎂", "🎈", "🎉", "💝", "💐", "🌹"
  ];

  // Get parent category name
  const getParentName = (parentId) => {
    const parent = categories.find(c => (c.category_id || c.id) === parentId);
    return parent ? parent.name : "";
  };

  // Recursive category row renderer
  const renderCategoryRow = (category, depth = 0, index = 0, siblings = []) => {
    const catId = category.category_id || category.id;
    const children = getChildren(catId);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(catId);
    const totalSubcats = getAllDescendantsCount(catId);
    const totalProducts = getTotalProductCount(catId);
    const directProducts = category.product_count || 0;
    const isSelected = selectedCategories.has(catId);
    const isFirst = index === 0;
    const isLast = index === siblings.length - 1;
    
    return (
      <div key={catId}>
        {/* Category Row */}
        <div 
          className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${depth === 0 ? 'bg-gradient-to-r from-[#FF8FAB]/5 to-transparent' : ''} ${isSelected ? 'bg-[#FF8FAB]/10' : ''} ${draggedCategory?.category_id === catId ? 'opacity-50' : ''}`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          draggable={depth === 0}
          onDragStart={(e) => depth === 0 && handleDragStart(e, category)}
          onDragOver={handleDragOver}
          onDrop={(e) => depth === 0 && handleDrop(e, category)}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle - Only for parent categories */}
            {depth === 0 && (
              <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded" title="Drag to reorder">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
            )}

            {/* Up/Down Arrows - Only for parent categories */}
            {depth === 0 && (
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveCategory(category, 'up')}
                  disabled={isFirst}
                  className={`p-0.5 rounded ${isFirst ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveCategory(category, 'down')}
                  disabled={isLast}
                  className={`p-0.5 rounded ${isLast ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Checkbox */}
            <button
              onClick={() => toggleSelectCategory(catId)}
              className="p-1"
              data-testid={`select-cat-${catId}`}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-[#FF8FAB]" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Expand/Collapse button */}
            {hasChildren ? (
              <button 
                onClick={() => toggleExpand(catId)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                data-testid={`toggle-${catId}`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <span className="w-6" /> // Spacer
            )}
            
            {/* Name and info */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-[#1A1A1A] ${depth === 0 ? 'text-lg font-bold' : ''}`}>
                {category.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                {/* Subcategory count */}
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {totalSubcats} {totalSubcats === 1 ? 'subcategory' : 'subcategories'}
                </span>
                {/* Product count */}
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {directProducts} direct / {totalProducts} total listings
                </span>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-2 mr-4">
            {totalSubcats > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {totalSubcats} sub
              </span>
            )}
            {totalProducts > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                {totalProducts} items
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleAddSubcategory(category)}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[#06D6A0] hover:bg-[#06D6A0]/10"
              title="Add Subcategory"
              data-testid={`add-sub-${catId}`}
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 hover:bg-[#FFD166]/20 rounded-lg transition-colors"
              title="Edit"
              data-testid={`edit-${catId}`}
            >
              <Pencil className="w-4 h-4 text-[#FFD166]" />
            </button>
            <button
              onClick={() => handleDelete(catId)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete"
              data-testid={`delete-${catId}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Children (recursive) */}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50/50">
            {children.map((child, idx) => renderCategoryRow(child, depth + 1, idx, children))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Categories & Attributes
              </h1>
              <p className="text-gray-500 mt-1">Manage categories, subcategories and custom product fields</p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveSection("categories")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeSection === "categories" 
                  ? "bg-[#FF8FAB] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              Categories
            </button>
            <button
              onClick={() => setActiveSection("attributes")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeSection === "attributes" 
                  ? "bg-[#FF8FAB] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Custom Attributes
            </button>
          </div>

          {/* Categories Section */}
          {activeSection === "categories" && (
            <>
              {/* Action Buttons Row - Select All & Delete Selected */}
              <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  {/* Select All Button */}
                  <Button
                    onClick={toggleSelectAllCategories}
                    variant="outline"
                    className={`rounded-full ${selectedCategories.size === categories.length && categories.length > 0 ? 'bg-[#FF8FAB]/10 border-[#FF8FAB] text-[#FF8FAB]' : ''}`}
                    data-testid="select-all-categories-btn"
                  >
                    {selectedCategories.size === categories.length && categories.length > 0 ? (
                      <CheckSquare className="w-5 h-5 mr-2" />
                    ) : (
                      <Square className="w-5 h-5 mr-2" />
                    )}
                    Select All
                  </Button>

                  {/* Delete Selected Button - Always visible but disabled when nothing selected */}
                  <Button 
                    onClick={handleDeleteSelectedCategories}
                    disabled={selectedCategories.size === 0}
                    className={`rounded-full ${selectedCategories.size > 0 ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    data-testid="delete-selected-categories-btn"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Selected {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                  </Button>

                  {/* Selected count info */}
                  {selectedCategories.size > 0 && (
                    <span className="text-sm text-[#6B7280]">
                      {selectedCategories.size} of {categories.length} selected
                    </span>
                  )}
                </div>

                {/* Right side - Add button */}
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full" data-testid="new-category-btn">
                      <Plus className="w-5 h-5 mr-2" />
                      New Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl">
                        {editingCategory ? "Edit Category" : formData.parent_id ? "New Subcategory" : "New Main Category"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      {/* Parent Category Selection - Now supports multi-level */}
                      <div>
                        <Label>Parent Category</Label>
                        <Select 
                          value={formData.parent_id || "main"} 
                          onValueChange={(v) => setFormData({...formData, parent_id: v === "main" ? null : v})}
                        >
                          <SelectTrigger className="mt-2" data-testid="parent-select">
                            <SelectValue placeholder="Select parent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">🏷️ Main Category (Top Level)</SelectItem>
                            {getAllPotentialParents(editingCategory?.category_id || editingCategory?.id).map((cat) => {
                              const depth = getCategoryDepth(cat.category_id || cat.id);
                              const indent = "  ".repeat(depth);
                              return (
                                <SelectItem 
                                  key={cat.category_id || cat.id} 
                                  value={cat.category_id || cat.id}
                                >
                                  {indent}↳ {cat.icon} {cat.name}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {formData.parent_id && (
                          <div className="text-sm text-[#FF8FAB] mt-2 p-2 bg-[#FF8FAB]/5 rounded-lg">
                            <span className="font-medium">Path:</span>{" "}
                            {getParentChain(formData.parent_id).map((c, i) => (
                              <span key={c.category_id || c.id}>
                                {i > 0 && " → "}
                                {c.icon} {c.name}
                              </span>
                            ))}
                            {" → "}<span className="text-gray-500">[New]</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={formData.parent_id ? "e.g., Boys Shirts, Girls Dresses" : "e.g., Clothes, Toys, Electronics"}
                      required
                      className="mt-1"
                      data-testid="category-name-input"
                    />
                  </div>

                  <div>
                    <Label>Icon</Label>
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2 mt-2">
                      <div className="flex flex-wrap gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: emoji })}
                            className={`w-8 h-8 text-base rounded-lg border transition-all hover:scale-110 ${
                              formData.icon === emoji ? "border-[#FF8FAB] bg-[#FF8FAB]/10 border-2" : "border-gray-200"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Image (Optional)</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                        {imageUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">Uploading...</span>
                          </div>
                        ) : imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Image className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Click to upload</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full" data-testid="submit-category-btn">
                      {editingCategory ? "Update" : "Add"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF8FAB]/10 rounded-xl flex items-center justify-center">
                  <Tags className="w-6 h-6 text-[#FF8FAB]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{mainCategories.length}</p>
                  <p className="text-sm text-gray-500">Main Categories</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{categories.filter(c => c.parent_id).length}</p>
                  <p className="text-sm text-gray-500">Total Subcategories</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{categories.reduce((sum, c) => sum + (c.product_count || 0), 0)}</p>
                  <p className="text-sm text-gray-500">Total Listings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Tree */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : mainCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Tags className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first main category</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full">
                <Plus className="w-5 h-5 mr-2" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100" data-testid="categories-tree">
              {/* Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Order</span>
                  <span className="ml-4">Category</span>
                </div>
                <span className="mr-24">Stats & Actions</span>
              </div>
              {/* Category Tree */}
              {mainCategories.map((category, idx) => renderCategoryRow(category, 0, idx, mainCategories))}
            </div>
          )}
            </>
          )}

          {/* Custom Attributes Section */}
          {activeSection === "attributes" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-500">Define custom fields that will appear when adding products</p>
                <Dialog open={attrDialogOpen} onOpenChange={setAttrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full">
                      <Plus className="w-5 h-5 mr-2" />
                      New Attribute
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl">Create Custom Attribute</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Attribute Name *</Label>
                        <Input
                          value={attrFormData.name}
                          onChange={(e) => setAttrFormData({...attrFormData, name: e.target.value})}
                          placeholder="e.g., Age Group, Material, Size Guide"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Field Type</Label>
                        <Select 
                          value={attrFormData.type} 
                          onValueChange={(v) => setAttrFormData({...attrFormData, type: v})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text Input</SelectItem>
                            <SelectItem value="number">Number Input</SelectItem>
                            <SelectItem value="select">Dropdown Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {attrFormData.type === "select" && (
                        <div>
                          <Label>Options (comma separated)</Label>
                          <Input
                            value={attrFormData.options}
                            onChange={(e) => setAttrFormData({...attrFormData, options: e.target.value})}
                            placeholder="e.g., 0-2 years, 3-5 years, 6-8 years"
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={attrFormData.required}
                          onChange={(e) => setAttrFormData({...attrFormData, required: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="required" className="text-sm cursor-pointer">Required field</Label>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="button" onClick={handleCreateAttribute} className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                          Create Attribute
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setAttrDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Attributes List */}
              {customAttributes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Custom Attributes</h3>
                  <p className="text-gray-500 mb-4">Create attributes like Age Group, Material, etc.</p>
                  <Button onClick={() => setAttrDialogOpen(true)} className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Attribute
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-600">
                    <span>Attribute Name</span>
                    <span>Type & Options</span>
                    <span>Actions</span>
                  </div>
                  {customAttributes.map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFD166]/20 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-[#FFD166]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#1A1A1A]">{attr.name}</h3>
                          {attr.required && <span className="text-xs text-red-500">Required</span>}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {attr.type}
                        </span>
                        {attr.type === "select" && attr.options?.length > 0 && (
                          <span className="ml-2 text-gray-500">
                            {attr.options.join(", ")}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
