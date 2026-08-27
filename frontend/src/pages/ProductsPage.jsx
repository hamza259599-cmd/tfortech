import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, SlidersHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ProductCard from "../components/ProductCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Placeholder image for categories without images
const placeholderImage = "https://placehold.co/400x400/F8F9FA/6B7280?text=No+Image";

export default function ProductsPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(category || "all");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(category || "all");
  }, [category]);

  // Update current category, subcategories and breadcrumb when category changes
  useEffect(() => {
    if (categories.length > 0 && selectedCategory && selectedCategory !== "all") {
      // Find current category
      const current = categories.find(c => 
        (c.category_id || c.id) === selectedCategory ||
        c.name?.toLowerCase() === selectedCategory?.toLowerCase()
      );
      setCurrentCategory(current);

      // Find subcategories
      const subs = categories.filter(c => c.parent_id === (current?.category_id || current?.id));
      setSubcategories(subs);

      // Build breadcrumb
      if (current) {
        const crumbs = [];
        let currentId = current.category_id || current.id;
        while (currentId) {
          const cat = categories.find(c => (c.category_id || c.id) === currentId);
          if (cat) {
            crumbs.unshift(cat);
            currentId = cat.parent_id;
          } else {
            break;
          }
        }
        setBreadcrumb(crumbs);
      }
    } else {
      setCurrentCategory(null);
      setSubcategories([]);
      setBreadcrumb([]);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }
        params.append("page", pagination.page);
        params.append("limit", 12);
        
        let response = await axios.get(`${API}/products?${params.toString()}`);
        let productsData = response.data.products || response.data;
        
        // If no products found and this is a subcategory, try fetching from parent category
        if (productsData.length === 0 && currentCategory?.parent_id) {
          const parentParams = new URLSearchParams();
          parentParams.append("category", currentCategory.parent_id);
          parentParams.append("page", pagination.page);
          parentParams.append("limit", 12);
          
          response = await axios.get(`${API}/products?${parentParams.toString()}`);
          productsData = response.data.products || response.data;
        }
        
        // Handle both old and new API response format
        if (response.data.products) {
          setProducts(productsData);
          setPagination({
            page: response.data.page,
            pages: response.data.pages,
            total: response.data.total
          });
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, pagination.page, currentCategory]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
  };

  // Get category display name
  const getCategoryDisplayName = () => {
    if (currentCategory) {
      return currentCategory.name;
    }
    return "All Products";
  };

  // Get main categories for filter dropdown
  const mainCategories = categories.filter(c => !c.parent_id);

  // Generate SEO title and description based on current category
  const getSEOTitle = () => {
    if (currentCategory) {
      return `${currentCategory.name} - Shop Tech & Gadgets`;
    }
    return "All Products - Laptops, Tech & Gadgets";
  };

  const getSEODescription = () => {
    if (currentCategory) {
      return `Shop ${currentCategory.name} at T For Tech. ${currentCategory.product_count || ''} quality tech products with Cash on Delivery across Pakistan. Free shipping on orders over Rs. 5000.`;
    }
    return "Browse all products at T For Tech. Quality laptops, tech, and gadgets with Cash on Delivery across Pakistan.";
  };

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO 
        title={getSEOTitle()}
        description={getSEODescription()}
        url={category ? `/products/${category}` : "/products"}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap" data-testid="breadcrumb">
            <Link to="/products" className="text-[#6B7280] hover:text-[#FF8FAB]">
              All Products
            </Link>
            {breadcrumb.map((crumb, index) => (
              <span key={crumb.category_id || crumb.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {index === breadcrumb.length - 1 ? (
                  <span className="text-[#1A1A1A] font-medium">
                    {crumb.name}
                  </span>
                ) : (
                  <Link 
                    to={`/products/${crumb.category_id || crumb.id}`}
                    className="text-[#6B7280] hover:text-[#FF8FAB]"
                  >
                    {crumb.name}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2" data-testid="products-title">
            {getCategoryDisplayName()}
          </h1>
          <p className="text-[#6B7280]">
            {subcategories.length > 0 && `${subcategories.length} subcategories • `}
            {products.length} products found
          </p>
        </div>

        {/* Subcategories Grid - Show when category has subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-[#FF8FAB]/5 to-[#FFD166]/5 rounded-3xl p-6">
            <h2 className="font-heading text-xl font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#FF8FAB] rounded-lg flex items-center justify-center text-white text-sm">📂</span>
              Browse Subcategories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" data-testid="subcategories-grid">
              {subcategories.map((subcat, index) => {
                const borderColors = ["#FF8FAB", "#FFD166", "#06D6A0", "#4ECDC4", "#9B59B6"];
                const borderColor = borderColors[index % 5];
                return (
                  <Link
                    key={subcat.category_id || subcat.id}
                    to={`/products/${subcat.category_id || subcat.id}`}
                    className="group flex flex-col items-center p-4 bg-white rounded-2xl border-2 hover:shadow-xl transition-all duration-300"
                    style={{ borderColor: `${borderColor}40`, '--hover-border': borderColor }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = borderColor}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = `${borderColor}40`}
                    data-testid={`subcat-${subcat.category_id || subcat.id}`}
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-lg transition-shadow border-2" style={{ borderColor }}>
                      <img
                        src={subcat.image_url || placeholderImage}
                        alt={subcat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-sm md:text-base font-semibold text-[#1A1A1A] text-center group-hover:text-[#FF8FAB] transition-colors line-clamp-2">
                      {subcat.name}
                    </span>
                    {subcat.product_count > 0 && (
                      <span className="text-xs text-white bg-[#FF8FAB] px-2 py-0.5 rounded-full mt-1">
                        {subcat.product_count} items
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-2 border-gray-200 focus:border-[#4CC9F0] h-12"
                data-testid="search-input"
              />
            </div>
          </form>

          {/* Category Filter - Dynamic from DB */}
          <Select value={selectedCategory} onValueChange={(val) => window.location.href = `/products/${val === 'all' ? '' : val}`}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-2 border-gray-200 h-12" data-testid="category-filter">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {mainCategories.map((cat) => (
                <SelectItem key={cat.category_id || cat.id} value={cat.category_id || cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Section */}
        {subcategories.length > 0 && products.length > 0 && (
          <h2 className="font-heading text-xl font-semibold text-[#1A1A1A] mb-4">
            Products in {currentCategory?.name}
          </h2>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-heading text-xl font-semibold text-[#1A1A1A] mb-2">
              Coming Soon!
            </h3>
            <p className="text-[#6B7280] mb-4">
              Products in this category will be available soon.
              {subcategories.length > 0 && " Browse the subcategories above!"}
            </p>
            <Link to="/products">
              <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" data-testid="products-grid">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} categories={categories} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      pagination.page === page
                        ? "text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                    style={pagination.page === page ? { backgroundColor: 'var(--color-primary)' } : {}}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Products Count */}
            <p className="text-center text-gray-500 mt-4">
              Showing {products.length} of {pagination.total} products
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
