import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ArrowRight, Sparkles, Truck, Shield, HeartHandshake, Pencil, Settings } from "lucide-react";
import { useAuth } from "../App";
import { toast } from "sonner";
import ProductCard from "../components/ProductCard";
import StylishText from "../components/StylishText";
import SEO from "../components/SEO";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default placeholder image when no image is available
const placeholderImage = "https://placehold.co/600x600/F8F9FA/6B7280?text=No+Image";
const heroPlaceholder = "https://placehold.co/1200x600/FF8FAB/FFFFFF?text=GoJuniors";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    image_url: ""
  });
  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, allRes, contentRes] = await Promise.all([
          axios.get(`${API}/products/featured`),
          axios.get(`${API}/products`),
          axios.get(`${API}/settings/content`)
        ]);
        setFeaturedProducts(featuredRes.data);
        // Handle both old array and new paginated format
        const allProducts = allRes.data.products || allRes.data || [];
        setAllProducts(allProducts);
        setSiteContent(contentRes.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || "",
      image_url: category.image_url || ""
    });
    setEditCategoryOpen(true);
  };

  const handleCategoryUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      await axios.put(`${API}/admin/categories/${editingCategory.id}`, categoryFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Category updated! ✅");
      setEditCategoryOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API}/upload/image`, { image: base64 }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategoryFormData(prev => ({ 
          ...prev, 
          image_url: `${BACKEND_URL}${response.data.image_url}` 
        }));
        toast.success("Image uploaded! ✅");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Image upload failed");
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Get category image from products in that category (priority: product image > DB image > default)
  const getCategoryImage = (categoryKey) => {
    // First, try to get image from a product in this category
    const categoryProduct = allProducts.find(p => 
      p.category?.toLowerCase() === categoryKey?.toLowerCase() ||
      p.category === categoryKey
    );
    if (categoryProduct?.image_url) return categoryProduct.image_url;
    
    // Fallback to category's own image from DB
    const dbCategory = categories.find(c => 
      c.name?.toLowerCase() === categoryKey?.toLowerCase() ||
      c.id === categoryKey
    );
    if (dbCategory?.image_url) return dbCategory.image_url;
    
    // Final fallback to placeholder
    return placeholderImage;
  };

  // Get category data
  const getCategoryData = (categoryKey) => {
    return categories.find(c => 
      c.name?.toLowerCase() === categoryKey?.toLowerCase() ||
      c.id === categoryKey
    );
  };

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO 
        title="Kids Clothes, Toys & Educational Items"
        description="Shop quality kids' clothes, toys, bags, and educational items at GoJuniors. Cash on Delivery available across Pakistan. Free shipping on orders over Rs. 5000."
        url="/"
      />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img 
            src={siteContent?.hero_image || heroPlaceholder} 
            alt="GoJuniors" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}>
              <Sparkles className="w-4 h-4" />
              New Arrivals!
            </span>
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {siteContent?.stylish_text?.enabled && siteContent?.stylish_text?.apply_to?.includes('hero_title') ? (
                <StylishText 
                  text={siteContent?.hero_title || "More Than a Bag. It's Your Signature."}
                  enabled={true}
                  intensity={siteContent?.stylish_text?.intensity || "medium"}
                  colors={
                    siteContent?.stylish_text?.preset === "playful" ? ["#FF8FAB", "#FFD166", "#4ECDC4", "#9B59B6", "#06D6A0"] :
                    siteContent?.stylish_text?.preset === "subtle" ? ["#FF8FAB", "#4ECDC4", "#FFFFFF"] :
                    siteContent?.stylish_text?.preset === "rainbow" ? ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1", "#9B59B6"] :
                    siteContent?.stylish_text?.preset === "monochrome" ? ["#FFFFFF", "#E5E5E5", "#CCCCCC"] :
                    ["#FF8FAB", "#FFD166", "#4ECDC4"]
                  }
                />
              ) : siteContent?.hero_title ? (
                <>
                  {siteContent.hero_title.split('.')[0]}. <span style={{color: 'var(--color-primary)'}}>{siteContent.hero_title.split('.').slice(1).join('.')}</span>
                </>
              ) : (
                <>More Than a Bag. <span style={{color: 'var(--color-primary)'}}>It's Your Signature.</span></>
              )}
            </h1>
            
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              {siteContent?.hero_subtitle || "Express your unique style with our collection of standout handbags. From the must-have classics to this season's conversation pieces, find the perfect accent to define your look."}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button 
                  className="hover:opacity-90 text-white rounded-full px-8 py-6 text-lg font-medium btn-hover-lift"
                  style={{backgroundColor: 'var(--color-primary)'}}
                  data-testid="shop-now-btn"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid - Only show if categories exist */}
      {categories.length > 0 && (
        <section className="py-16 lg:py-24" data-testid="categories-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
                  Categories
                </h2>
                {isAdmin && (
                  <Link to="/admin/categories">
                    <Button variant="outline" size="sm" className="mb-4 border-[#FF8FAB] text-[#FF8FAB]">
                      <Settings className="w-4 h-4 mr-1" />
                      Manage All
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-[#6B7280] text-lg mb-6">Choose your favorite category</p>
              
              {/* View All Button */}
              <Link to="/categories">
                <Button 
                  variant="outline" 
                  className="border-[#FFD166] text-[#1A1A1A] hover:bg-[#FFD166]/10 rounded-full px-6"
                >
                  View All Categories
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Dynamic Categories Grid - Only Main Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {categories
                .filter(cat => !cat.parent_id && cat.parent_id !== "")
                .map((category, index) => {
                const bgColors = ["#FF8FAB", "#FFD166", "#06D6A0", "#4ECDC4", "#9B59B6"];
                const bgColor = bgColors[index % 5];
                return (
                  <div key={category.id} className="relative group">
                    <Link 
                      to={`/products/${category.id}`} 
                      className="block relative overflow-hidden rounded-2xl aspect-square"
                      data-testid={`category-${category.id}`}
                    >
                      <img 
                        src={category.image_url || getCategoryImage(category.name?.toLowerCase())} 
                        alt={category.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-heading text-lg font-bold text-white mb-0.5 line-clamp-1">{category.name}</h3>
                        {category.product_count > 0 && (
                          <p className="text-gray-200 text-xs">{category.product_count} items</p>
                        )}
                      </div>
                    </Link>
                    {/* Admin Edit Button */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditCategory(category);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Edit Category"
                      >
                        <Pencil className="w-3 h-3" style={{color: bgColor}} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Category Edit Dialog */}
      <Dialog open={editCategoryOpen} onOpenChange={setEditCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategoryUpdate} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category Image</Label>
              <p className="text-xs text-gray-500 mb-2">Upload image from your computer (JPG, PNG)</p>
              <label className="mt-2 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#FF8FAB] transition-colors relative overflow-hidden">
                {imageUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-[#FF8FAB] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                ) : categoryFormData.image_url ? (
                  <>
                    <img src={categoryFormData.image_url} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to change image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-[#FF8FAB]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">📷</span>
                    </div>
                    <span className="text-gray-600 font-medium">Click to upload image</span>
                    <span className="text-xs text-gray-400 block mt-1">from your computer</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleCategoryImageUpload} className="hidden" disabled={imageUploading} />
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                Update Category
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditCategoryOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Featured Products - Only show if products exist */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white" data-testid="featured-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
                  Featured Products
                </h2>
                <p className="text-[#6B7280]">Most loved items by our customers</p>
              </div>
              <Link to="/products">
                <Button variant="outline" className="rounded-full border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} categories={categories} />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Features - Dynamic from Site Content */}
      <section className="py-16 lg:py-24" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(siteContent?.service_features || [
              { icon: "🚚", title: "Free Delivery", description: "On orders over Rs. 5000" },
              { icon: "📦", title: "Free Shipping", description: "On order over Rs. 2000" },
              { icon: "✅", title: "Quality Guarantee", description: "30-day return policy" }
            ]).map((feature, index) => {
              const bgColors = ["#FF8FAB", "#FFD166", "#06D6A0"];
              const bgColor = bgColors[index % 3];
              return (
                <div key={index} className="text-center p-8 bg-white rounded-3xl shadow-sm">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${bgColor}20` }}
                  >
                    <span className="text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-[#1A1A1A] mb-2">{feature.title}</h3>
                  <p className="text-[#6B7280]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
