import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const placeholderImage = "https://placehold.co/400x400/F8F9FA/6B7280?text=No+Image";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parent_id);

  // Get subcategories for a parent
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  return (
    <Layout>
      {/* SEO Meta Tags */}
      <SEO 
        title="Shop by Category - Laptops, Tech & Gadgets"
        description="Browse all categories at T For Tech. Find laptops, phones, accessories and more tech products with Cash on Delivery across Pakistan."
        url="/categories"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            All Categories
          </h1>
          <p className="text-[#6B7280] text-lg">
            Browse our complete collection by category
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : mainCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="font-heading text-xl font-semibold text-[#1A1A1A] mb-2">
              No Categories Yet
            </h3>
            <p className="text-[#6B7280]">
              Categories will appear here once added
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Main Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {mainCategories.map((category, index) => {
                const bgColors = ["#3B82F6", "#FFD166", "#06D6A0", "#4ECDC4", "#9B59B6", "#E74C3C", "#3498DB"];
                const bgColor = bgColors[index % bgColors.length];
                const subcats = getSubcategories(category.category_id || category.id);
                
                return (
                  <Link
                    key={category.category_id || category.id}
                    to={`/products/${category.category_id || category.id}`}
                    className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Category Image */}
                    <img
                      src={category.image_url || placeholderImage}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                    
                    {/* Color Overlay if no image */}
                    {!category.image_url && (
                      <div 
                        className="absolute inset-0" 
                        style={{ backgroundColor: bgColor, opacity: 0.8 }}
                      />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    {/* Category Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading text-lg font-bold text-white mb-1 line-clamp-1">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        {category.product_count > 0 && (
                          <span className="text-gray-200 text-sm">
                            {category.product_count} items
                          </span>
                        )}
                        {subcats.length > 0 && (
                          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                            {subcats.length} subcategories
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <ArrowRight className="w-4 h-4 text-[#1A1A1A]" />
                    </div>

                    {/* Color accent border on hover */}
                    <div 
                      className="absolute inset-0 border-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderColor: bgColor }}
                    ></div>
                  </Link>
                );
              })}
            </div>

            {/* Subcategories Section - Show for each main category that has subcategories */}
            {mainCategories.map((mainCat) => {
              const subcats = getSubcategories(mainCat.category_id || mainCat.id);
              if (subcats.length === 0) return null;

              return (
                <div key={`sub-${mainCat.category_id || mainCat.id}`} className="bg-gray-50 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-xl font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <span className="text-2xl">{mainCat.icon || "📂"}</span>
                      {mainCat.name} - Subcategories
                    </h2>
                    <Link 
                      to={`/products/${mainCat.category_id || mainCat.id}`}
                      className="text-[#3B82F6] hover:underline text-sm font-medium flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {subcats.map((subcat, index) => {
                      const borderColors = ["#3B82F6", "#FFD166", "#06D6A0", "#4ECDC4", "#9B59B6"];
                      const borderColor = borderColors[index % borderColors.length];
                      
                      return (
                        <Link
                          key={subcat.category_id || subcat.id}
                          to={`/products/${subcat.category_id || subcat.id}`}
                          className="group flex flex-col items-center p-3 bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300"
                          style={{ borderColor: `${borderColor}40` }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = borderColor}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = `${borderColor}40`}
                        >
                          <div 
                            className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden mb-2 shadow-sm border-2 flex items-center justify-center"
                            style={{ borderColor, backgroundColor: !subcat.image_url ? `${borderColor}20` : 'transparent' }}
                          >
                            {subcat.image_url ? (
                              <img
                                src={subcat.image_url}
                                alt={subcat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span class="text-3xl">${subcat.icon || '📦'}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-3xl">{subcat.icon || '📦'}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#1A1A1A] text-center group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                            {subcat.name}
                          </span>
                          {(subcat.product_count > 0) && (
                            <span className="text-xs text-gray-500 mt-1">
                              {subcat.product_count} items
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
