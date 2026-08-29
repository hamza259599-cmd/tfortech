import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useCart, useAuth } from "../App";
import { toast } from "sonner";
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, Truck, Shield, Heart, Share2, Star, MessageSquare, Copy, Facebook, Send, DollarSign, RotateCcw, ZoomIn, X } from "lucide-react";
import StylishText from "../components/StylishText";
import SEO from "../components/SEO";
import { trackProductView, trackConversion } from "../components/VisitorTracker";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [whatsappSettings, setWhatsappSettings] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null); // Combined color+size variation
  
  // Product Variations (new system - Color, Size, Material, Warranty, etc.)
  const [selectedProductVariations, setSelectedProductVariations] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [generatedSku, setGeneratedSku] = useState(null);
  
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    shipping_text: "Free 5000+",
    cod_text: "Available",
    returns_text: "20 Days"
  });
  const [popularityBadge, setPopularityBadge] = useState({
    enabled: true,
    badge_type: "random",
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
  });
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const images = getCurrentImages();
    if (isLeftSwipe && images.length > 1) {
      // Swipe left - next image
      setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
    if (isRightSwipe && images.length > 1) {
      // Swipe right - previous image
      setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
    }
  };
  
  // Wishlist & Reviews states
  const [inWishlist, setInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Color code mapping
  const colorCodes = {
    "Black": "#000000",
    "White": "#FFFFFF",
    "Red": "#FF0000",
    "Blue": "#0066CC",
    "Navy": "#001F3F",
    "Green": "#2ECC40",
    "Yellow": "#FFDC00",
    "Pink": "#FF69B4",
    "Purple": "#9B59B6",
    "Orange": "#FF851B",
    "Brown": "#8B4513",
    "Grey": "#808080",
    "Gray": "#808080",
    "Beige": "#F5F5DC",
    "Maroon": "#800000"
  };

  // Fetch categories first
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
    const fetchWhatsappSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings/whatsapp`);
        setWhatsappSettings(response.data);
      } catch (error) {
        console.error("Error fetching WhatsApp settings:", error);
      }
    };
    fetchWhatsappSettings();
  }, []);

  // Fetch product, wishlist status, and reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}`);
        const productData = response.data;
        setProduct(productData);
        
        // Track product view for ad campaigns
        trackProductView(productData.product_id, productData.name);
        
        // Handle combined variations (new system)
        if (productData.variations && productData.variations.length > 0) {
          const firstVar = productData.variations[0];
          setSelectedColor(firstVar.color);
          setSelectedSize(firstVar.size);
          setSelectedVariation(firstVar);
        } else {
          // Fallback to old system
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    
    // Fetch delivery info from site content
    const fetchDeliveryInfo = async () => {
      try {
        const response = await axios.get(`${API}/settings/content`);
        if (response.data.delivery_info) {
          setDeliveryInfo(response.data.delivery_info);
        }
        if (response.data.popularity_badge) {
          setPopularityBadge(response.data.popularity_badge);
        }
      } catch (error) {
        console.error("Error fetching delivery info:", error);
      }
    };
    fetchDeliveryInfo();
  }, [id]);

  // Get popularity badge text (random or fixed)
  const getPopularityBadgeText = (productId) => {
    if (!popularityBadge?.enabled || popularityBadge?.badge_type === "hide") {
      return null;
    }
    
    if (popularityBadge?.badge_type === "fixed") {
      return popularityBadge?.fixed_text || "100+ bought since yesterday";
    }
    
    // Random - use product ID as seed for consistent randomness per product
    const options = popularityBadge?.random_options || [
      "50+ bought today",
      "100+ bought since yesterday",
      "Best Seller",
      "Trending Now"
    ];
    
    // Simple hash from product ID for consistent random selection
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % options.length;
    return options[index];
  };

  // Update selected variation when color or size changes
  useEffect(() => {
    if (product?.variations && selectedColor && selectedSize) {
      const variation = product.variations.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariation(variation || null);
    }
  }, [product, selectedColor, selectedSize]);

  // Fetch wishlist status
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!isAuthenticated || !id) return;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/wishlist/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInWishlist(response.data.in_wishlist);
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };
    fetchWishlistStatus();
  }, [id, isAuthenticated]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${API}/products/${id}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        // Try to fetch by category first
        let response;
        let products = [];
        
        if (product.category) {
          response = await axios.get(`${API}/products?category=${product.category}&limit=8`);
          products = response.data.products || response.data || [];
        }
        
        // Filter out current product
        let filtered = products.filter(p => p.product_id !== id);
        
        // If no related products found, fetch all products
        if (filtered.length === 0) {
          response = await axios.get(`${API}/products?limit=8`);
          products = response.data.products || response.data || [];
          filtered = products.filter(p => p.product_id !== id);
        }
        
        setRelatedProducts(filtered.slice(0, 4));
      } catch (error) {
        console.error("Error fetching related products:", error);
        // On error, try to fetch any products
        try {
          const fallbackRes = await axios.get(`${API}/products?limit=5`);
          const fallbackProducts = fallbackRes.data.products || fallbackRes.data || [];
          setRelatedProducts(fallbackProducts.filter(p => p.product_id !== id).slice(0, 4));
        } catch (e) {
          console.error("Fallback fetch also failed:", e);
        }
      }
    };
    fetchRelatedProducts();
  }, [product, id]);

  // Get unique colors from variations
  const getUniqueColors = () => {
    if (!product?.variations) return [];
    const colors = [...new Set(product.variations.map(v => v.color))];
    return colors;
  };

  // Get unique sizes from variations
  const getUniqueSizes = () => {
    if (!product?.variations) return [];
    const sizes = [...new Set(product.variations.map(v => v.size))];
    return sizes;
  };

  // Get variation for specific color+size
  const getVariation = (color, size) => {
    if (!product?.variations) return null;
    return product.variations.find(v => v.color === color && v.size === size);
  };

  // Check if a size is available for selected color
  const isSizeAvailable = (size) => {
    if (!product?.variations) return true;
    const variation = getVariation(selectedColor, size);
    return variation && variation.stock > 0;
  };

  // Category display mapping
  const getCategoryDisplay = (categoryId) => {
    // Look up category name from categories list
    if (!categoryId) return "Uncategorized";
    
    // Find category by ID
    const category = categories.find(c => 
      (c.category_id || c.id) === categoryId || 
      c.name?.toLowerCase() === categoryId?.toLowerCase()
    );
    
    if (category) {
      return category.name;
    }
    
    // Fallback: format the ID if category not found
    const formatted = categoryId.replace(/^cat_/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return formatted;
  };

  // Get current images based on selected variation or color
  const getCurrentImages = () => {
    if (selectedVariation?.images?.length > 0) {
      return selectedVariation.images;
    }
    // Fallback: get any image from same color
    if (product?.variations && selectedColor) {
      const colorVar = product.variations.find(v => v.color === selectedColor && v.images?.length > 0);
      if (colorVar?.images?.length > 0) return colorVar.images;
    }
    return product?.image_urls || [product?.image_url];
  };

  // Auto-slide through product images every 4s (pauses while zoomed)
  useEffect(() => {
    const images = getCurrentImages();
    if (!images || images.length <= 1 || isZoomOpen) return;
    const interval = setInterval(() => {
      setSelectedImage(prev => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [product, selectedVariation, selectedColor, isZoomOpen]);

  // Close zoom on Escape key
  useEffect(() => {
    if (!isZoomOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsZoomOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isZoomOpen]);

        const getYouTubeEmbedUrl = (url) => {
          if (!url) return null;
          const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          return match ? `https://www.youtube.com/embed/${match[1]}` : null;
        };


  // Get current price based on selected variation
  const getCurrentPrice = () => {
    // First check combined variation
    if (selectedVariation && selectedVariation.price) {
      return {
        price: selectedVariation.price,
        discount_price: selectedVariation.discount_price
      };
    }
    // Fallback to product base price
    return {
      price: product?.price,
      discount_price: product?.discount_price
    };
  };

  // Get current stock based on selected variation
  const getCurrentStock = () => {
    if (selectedVariation) {
      return selectedVariation.stock ?? 0;
    }
    return product?.stock ?? 0;
  };

  // Handle color selection
  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName);
    setSelectedImage(0); // Reset to first image
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleOrderOnWhatsApp = () => {
    if (!whatsappSettings?.notify_number) {
      toast.error("WhatsApp ordering is not configured yet.");
      return;
    }
    const template = whatsappSettings.order_message_template ||
      "Hello, I want to order:\n\nProduct: {{product_name}}\nPrice: Rs. {{price}}\nQuantity: {{quantity}}\nProduct Link: {{product_url}}";
    const effectivePrice = product.discount_price || product.price;
    const message = template
      .replaceAll("{{product_name}}", product.name || "")
      .replaceAll("{{price}}", effectivePrice != null ? String(effectivePrice) : "")
      .replaceAll("{{quantity}}", String(quantity))
      .replaceAll("{{product_url}}", window.location.href)
      .replaceAll("{{sku}}", product.sku || "")
      .replaceAll("{{category}}", product.category || "")
      .replaceAll("{{description}}", product.description || "");

    const phone = whatsappSettings.notify_number.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Check new product_variations system
    if (product?.product_variations?.length > 0) {
      const requiredVariations = product.product_variations.filter(v => v.required);
      const missingRequired = requiredVariations.filter(v => !selectedProductVariations[v.id]);
      
      if (missingRequired.length > 0) {
        toast.error(`Please select: ${missingRequired.map(v => v.heading).join(', ')}`);
        return;
      }
      
      // Check stock for selected variations
      for (const [varId, value] of Object.entries(selectedProductVariations)) {
        if (value.stock === 0) {
          toast.error(`${value.name} is out of stock`);
          return;
        }
      }
    }

    // Check old variation system
    if (product?.variations?.length > 0) {
      if (!selectedVariation || selectedVariation.stock === 0) {
        toast.error("Please select available color and size");
        return;
      }
    } else if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    setAddingToCart(true);
    
    // Calculate final price with variations
    let finalPrice = product.discount_price || product.price;
    let variationDetails = [];
    
    if (Object.keys(selectedProductVariations).length > 0) {
      Object.entries(selectedProductVariations).forEach(([varId, value]) => {
        finalPrice += (value.priceModifier || 0);
        const variation = product.product_variations?.find(v => v.id === varId);
        variationDetails.push(`${variation?.heading}: ${value.name}`);
      });
    }
    
    const success = await addToCart(product.product_id, quantity, selectedSize, {
      selectedProductVariations,
      variationDetails: variationDetails.join(', '),
      finalPrice
    });
    setAddingToCart(false);

    if (success) {
      toast.success("Added to cart!");
      // Track conversion for ad campaigns
      trackConversion("cart", product.product_id);
    } else {
      toast.error("Something went wrong");
    }
  };

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (inWishlist) {
        await axios.post(`${API}/wishlist/remove`, 
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`${API}/wishlist/add`, 
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInWishlist(true);
        toast.success("Added to wishlist! ❤️");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // Share product
  const handleShare = async (method) => {
    const productUrl = window.location.href;
    const productText = `Check out ${product.name} on T For Tech!`;

    if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(productText + ' ' + productUrl)}`, '_blank');
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    } else if (method === 'native' && navigator.share) {
      try {
        await navigator.share({ title: product.name, text: productText, url: productUrl });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/products/${id}/reviews`, 
        { rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted! Thank you 🎉");
      setShowReviewForm(false);
      setReviewComment("");
      setReviewRating(5);
      // Refresh reviews
      const response = await axios.get(`${API}/products/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Review error:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product?.rating || 0;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-100 rounded-3xl h-[500px] animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-100 rounded animate-pulse w-1/2"></div>
              <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-4">
            Product not found
          </h2>
          <Link to="/products">
            <Button className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full">
              Go Back
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta Tags with Product Structured Data */}
      <SEO 
        title={product.name}
        description={product.description?.replace(/<[^>]*>/g, '').substring(0, 160)}
        image={product.image_url || product.image_urls?.[0]}
        url={`/product/${id}`}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          image_url: product.image_url,
          image_urls: product.image_urls,
          product_id: product.product_id,
          price: product.price,
          discount_price: product.discount_price,
          is_sold_out: product.is_sold_out,
          stock: getCurrentStock(),
          rating: averageRating,
          review_count: reviews.length
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images with Gallery */}
          <div className="relative">
            {/* Main Image with Slider */}
            <div 
              className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-lg mb-4 touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img 
                src={getCurrentImages()[selectedImage] || product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover select-none cursor-zoom-in"
                data-testid="product-image"
                draggable="false"
                onClick={() => setIsZoomOpen(true)}
              />

              {/* Zoom hint icon */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                data-testid="zoom-image-btn"
                aria-label="Zoom image"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Left Arrow */}
              {getCurrentImages().length > 1 && (
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? getCurrentImages().length - 1 : prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  data-testid="prev-image-btn"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Right Arrow */}
              {getCurrentImages().length > 1 && (
                <button
                  onClick={() => setSelectedImage(prev => prev === getCurrentImages().length - 1 ? 0 : prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                  data-testid="next-image-btn"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Image Counter */}
              {getCurrentImages().length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {getCurrentImages().length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery - shows images based on selected color */}
            {getCurrentImages().length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {getCurrentImages().map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#FF8FAB] ring-2 ring-[#FF8FAB]/30' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Fullscreen Zoom Modal */}
            {isZoomOpen && (
              <div
                className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setIsZoomOpen(false)}
                data-testid="zoom-modal"
              >
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  aria-label="Close zoom"
                >
                  <X className="w-6 h-6" />
                </button>

                {getCurrentImages().length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === 0 ? getCurrentImages().length - 1 : prev - 1); }}
                    className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <img
                  src={getCurrentImages()[selectedImage] || product.image_url}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                  draggable="false"
                />

                {getCurrentImages().length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === getCurrentImages().length - 1 ? 0 : prev + 1); }}
                    className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}

                {getCurrentImages().length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm">
                    {selectedImage + 1} / {getCurrentImages().length}
                  </div>
                )}
              </div>
            )}
            
            {product.is_sold_out && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-medium">
                Sold Out
              </span>
            )}
            {!product.is_sold_out && product.stock < 10 && (
              <span className="absolute top-4 left-4 bg-[#FF8FAB] text-white px-4 py-2 rounded-full font-medium">
                Only {product.stock} left!
              </span>
            )}
              {product.video_url && getYouTubeEmbedUrl(product.video_url) && (
                <div className="mt-4 rounded-2xl overflow-hidden shadow-lg aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(product.video_url)}
                    title={`${product.name} video`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

          </div>

          {/* Product Info */}
          <div>
            <span className="inline-block bg-[#FFD166]/20 text-[#1A1A1A] px-3 py-1 rounded-full text-sm font-medium mb-4">
              {getCategoryDisplay(product.category)}
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4" data-testid="product-name">
              {product.stylish_settings?.enabled && product.stylish_words?.length > 0 ? (
                // Render with stylish words
                product.name.split(/\s+/).map((word, i) => {
                  const isStylish = product.stylish_words?.some(sw => 
                    word.toLowerCase().includes(sw.toLowerCase()) || 
                    sw.toLowerCase().includes(word.toLowerCase())
                  );
                  
                  if (isStylish) {
                    return (
                      <span key={i}>
                        <StylishText 
                          text={word}
                          enabled={true}
                          intensity={product.stylish_settings?.intensity || "medium"}
                          colors={
                            product.stylish_settings?.preset === "playful" ? ["#FF8FAB", "#FFD166", "#4ECDC4", "#9B59B6", "#06D6A0"] :
                            product.stylish_settings?.preset === "rainbow" ? ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1", "#9B59B6"] :
                            product.stylish_settings?.preset === "subtle" ? ["#FF8FAB", "#4ECDC4"] :
                            ["#FF8FAB", "#FFD166", "#4ECDC4"]
                          }
                        />
                        {" "}
                      </span>
                    );
                  }
                  return <span key={i}>{word} </span>;
                })
              ) : (
                product.name
              )}
            </h1>

            {/* Short Description - Header Area */}
            <p className="text-[#6B7280] text-lg leading-relaxed mb-4" data-testid="product-description">
              {(() => {
                const plainText = product.description?.replace(/<[^>]*>/g, '') || '';
                return plainText.length > 150 
                  ? plainText.substring(0, 150) + "..." 
                  : plainText;
              })()}
            </p>
            
            {/* View Full Details Link */}
            {product.description?.replace(/<[^>]*>/g, '')?.length > 150 && (
              <button 
                onClick={() => document.getElementById('product-details-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#FF8FAB] hover:underline text-sm mb-4 flex items-center gap-1"
              >
                View full product details ↓
              </button>
            )}

            {product.ages && (
              <p className="text-[#6B7280] mb-4">
                <span className="font-medium">Suitable Age:</span> {product.ages}
              </p>
            )}

            {/* Device Specs Quick View - Show badges for key specs */}
            {product.device_specs && (product.device_specs.brand || product.device_specs.ram || product.device_specs.storage || product.device_specs.processor) && (
              <div className="flex flex-wrap gap-2 mb-4" data-testid="device-specs-badges">
                {product.device_specs.brand && (
                  <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                    🏷️ {product.device_specs.brand}
                  </span>
                )}
                {product.device_specs.ram && (
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    💾 {product.device_specs.ram}
                  </span>
                )}
                {product.device_specs.storage && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    💿 {product.device_specs.storage}
                  </span>
                )}
                {product.device_specs.processor && (
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    ⚡ {product.device_specs.processor}
                  </span>
                )}
                {product.device_specs.condition && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    ✓ {product.device_specs.condition}
                  </span>
                )}
                {product.device_specs.warranty && (
                  <span className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                    🛡️ {product.device_specs.warranty}
                  </span>
                )}
              </div>
            )}

            {/* Price - Dynamic based on selected variation */}
            <div className="flex items-baseline gap-4 mb-6">
              {(() => {
                const priceInfo = getCurrentPrice();
                const displayPrice = priceInfo.discount_price || priceInfo.price;
                const originalPrice = priceInfo.discount_price ? priceInfo.price : null;
                
                return (
                  <>
                    <span className="font-heading text-4xl font-bold text-[#FF8FAB]" data-testid="product-price">
                      Rs. {displayPrice?.toFixed(0)}
                    </span>
                    {originalPrice && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          Rs. {originalPrice.toFixed(0)}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                          {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* NEW PRODUCT VARIATIONS SYSTEM (Color, Size, Material, Warranty, etc.) */}
            {product.product_variations && product.product_variations.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                    Select your options below
                  </span>
                </div>
                
                {product.product_variations.map((variation) => (
                  <div key={variation.id} className="mb-5 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-heading font-semibold text-[#1A1A1A]">
                        {variation.heading}
                        {variation.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {selectedProductVariations[variation.id] && (
                        <span className="text-xs bg-[#FF8FAB]/10 text-[#FF8FAB] px-2 py-0.5 rounded-full">
                          {selectedProductVariations[variation.id].name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {variation.values.map((value) => {
                        const isSelected = selectedProductVariations[variation.id]?.value === value.value;
                        const isOutOfStock = value.stock === 0;
                        
                        return (
                          <button
                            key={value.value}
                            onClick={() => {
                              if (!isOutOfStock) {
                                setSelectedProductVariations(prev => ({
                                  ...prev,
                                  [variation.id]: value
                                }));
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                              isSelected
                                ? "border-[#FF8FAB] bg-[#FF8FAB]/10 text-[#FF8FAB]"
                                : isOutOfStock
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                                : "border-gray-200 bg-white text-gray-700 hover:border-[#FF8FAB]"
                            }`}
                            data-testid={`variation-${variation.id}-${value.value}`}
                          >
                            {value.name}
                            {value.priceModifier > 0 && (
                              <span className="text-xs text-green-600 ml-1">+Rs.{value.priceModifier}</span>
                            )}
                            {value.priceModifier < 0 && (
                              <span className="text-xs text-red-600 ml-1">Rs.{value.priceModifier}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Dynamic Price based on selections */}
                {Object.keys(selectedProductVariations).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Total Price: </span>
                        <span className="font-bold text-xl text-[#FF8FAB]">
                          Rs. {(() => {
                            let total = product.discount_price || product.price;
                            Object.values(selectedProductVariations).forEach(v => {
                              total += (v.priceModifier || 0);
                            });
                            return total.toFixed(0);
                          })()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Selected Options Summary */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(selectedProductVariations).map(([varId, value]) => {
                        const variation = product.product_variations.find(v => v.id === varId);
                        return (
                          <span key={varId} className="text-xs bg-white border px-2 py-1 rounded-full">
                            <strong>{variation?.heading}:</strong> {value.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Validation message for required variations */}
                {(() => {
                  const requiredVariations = product.product_variations.filter(v => v.required);
                  const missingRequired = requiredVariations.filter(v => !selectedProductVariations[v.id]);
                  
                  if (missingRequired.length > 0) {
                    return (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Please select: {missingRequired.map(v => v.heading).join(', ')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* COMBINED VARIATIONS SYSTEM - Color + Size with Price & Stock */}
            {product.variations && product.variations.length > 0 ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                {/* Color Selection */}
                <div className="flex items-start gap-4 mb-4">
                  <h3 className="font-heading font-semibold text-[#1A1A1A] min-w-[60px] pt-2">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueColors().map((color) => {
                      // Get first variation with this color to show image
                      const colorVar = product.variations.find(v => v.color === color);
                      const hasImage = colorVar?.images?.length > 0;
                      
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          className={`relative rounded-lg border-2 transition-all overflow-hidden ${
                            selectedColor === color
                              ? "border-[#FF8FAB] ring-2 ring-[#FF8FAB]/30"
                              : "border-gray-200 hover:border-[#FF8FAB]"
                          }`}
                          title={color}
                          data-testid={`color-${color}`}
                        >
                          {hasImage ? (
                            <div className="w-14 h-14">
                              <img 
                                src={colorVar.images[0]} 
                                alt={color}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div 
                              className="w-12 h-12 flex items-center justify-center"
                              style={{ backgroundColor: colorCodes[color] || '#ccc' }}
                            >
                              {selectedColor === color && (
                                <Check className={`w-5 h-5 ${['White', 'Yellow', 'Beige'].includes(color) ? 'text-black' : 'text-white'}`} />
                              )}
                            </div>
                          )}
                          <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] text-center py-0.5 truncate px-1">
                            {color}
                          </span>
                          {selectedColor === color && hasImage && (
                            <span className="absolute top-1 right-1 w-5 h-5 bg-[#FF8FAB] rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="flex items-start gap-4 mb-4">
                  <h3 className="font-heading font-semibold text-[#1A1A1A] min-w-[60px] pt-2">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueSizes().map((size) => {
                      const variation = getVariation(selectedColor, size);
                      const isAvailable = variation && variation.stock > 0;
                      const stock = variation?.stock ?? 0;
                      const isLowStock = stock > 0 && stock < 10;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && handleSizeSelect(size)}
                          disabled={!isAvailable}
                          className={`relative px-3 py-2 rounded-lg border-2 font-medium transition-all min-w-[70px] ${
                            !isAvailable 
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : selectedSize === size
                                ? "border-[#FF8FAB] bg-[#FF8FAB]/10 text-[#FF8FAB]"
                                : "border-gray-200 hover:border-[#FF8FAB] hover:text-[#FF8FAB]"
                          }`}
                          data-testid={`size-${size}`}
                        >
                          <span className={!isAvailable ? 'line-through' : ''}>{size}</span>
                          <span className={`block text-[10px] mt-0.5 font-normal ${
                            !isAvailable ? 'text-red-400' : isLowStock ? 'text-orange-500' : 'text-green-600'
                          }`}>
                            {!isAvailable ? 'Out of Stock' : `${stock} left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Variation Info - Price & Stock */}
                {selectedVariation ? (
                  <div className="ml-[76px] p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#1A1A1A]">
                        {selectedColor} / {selectedSize}
                      </span>
                      <span className="text-[#FF8FAB] font-bold text-lg">
                        Rs. {selectedVariation.discount_price || selectedVariation.price}
                        {selectedVariation.discount_price && (
                          <span className="text-gray-400 line-through ml-2 text-sm font-normal">
                            Rs. {selectedVariation.price}
                          </span>
                        )}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedVariation.stock < 10 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {selectedVariation.stock} in stock
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="ml-[76px] p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-red-500 text-sm">This color + size combination is not available</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* FALLBACK: Old system for products without combined variations */}
                {/* Color Selection (old color_variations) */}
                {product.color_variations && product.color_variations.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-heading font-semibold text-[#1A1A1A] min-w-[60px]">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.color_variations.map((colorVar) => (
                          <button
                            key={colorVar.name}
                            onClick={() => handleColorSelect(colorVar.name)}
                            className={`relative rounded-lg border-2 transition-all overflow-hidden ${
                              selectedColor === colorVar.name
                                ? "border-[#FF8FAB] ring-2 ring-[#FF8FAB]/30"
                                : "border-gray-200 hover:border-[#FF8FAB]"
                            }`}
                            title={colorVar.name}
                            data-testid={`color-${colorVar.name}`}
                          >
                            {colorVar.images && colorVar.images.length > 0 ? (
                              <div className="w-14 h-14">
                                <img src={colorVar.images[0]} alt={colorVar.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div 
                                className="w-12 h-12 flex items-center justify-center"
                                style={{ backgroundColor: colorVar.code || colorCodes[colorVar.name] || '#ccc' }}
                              >
                                {selectedColor === colorVar.name && <Check className="w-5 h-5 text-white" />}
                              </div>
                            )}
                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] text-center py-0.5">{colorVar.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple colors without variations */}
                {(!product.color_variations || product.color_variations.length === 0) && product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-heading font-semibold text-[#1A1A1A] min-w-[60px]">Color</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            className={`relative w-10 h-10 rounded-lg border-2 transition-all ${
                              selectedColor === color
                                ? "border-[#FF8FAB] ring-2 ring-[#FF8FAB]/30"
                                : "border-gray-200 hover:border-[#FF8FAB]"
                            }`}
                            style={{ backgroundColor: colorCodes[color] || color }}
                            title={color}
                            data-testid={`color-${color}`}
                          >
                            {selectedColor === color && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Check className={`w-5 h-5 ${['White', 'Yellow', 'Beige'].includes(color) ? 'text-black' : 'text-white'}`} />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Size Selection (old system) */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-heading font-semibold text-[#1A1A1A] min-w-[60px]">Size</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => {
                          const sizeVariation = product.size_variations?.find(sv => sv.name === size);
                          const sizeStock = sizeVariation?.stock ?? product.stock;
                          const isOutOfStock = sizeStock === 0;
                          
                          return (
                            <button
                              key={size}
                              onClick={() => !isOutOfStock && setSelectedSize(size)}
                              disabled={isOutOfStock}
                              className={`relative px-3 py-2 rounded-lg border-2 font-medium transition-all min-w-[60px] ${
                                isOutOfStock 
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                                  : selectedSize === size
                                    ? "border-[#FF8FAB] bg-[#FF8FAB]/10 text-[#FF8FAB]"
                                    : "border-gray-200 hover:border-[#FF8FAB] hover:text-[#FF8FAB]"
                              }`}
                              data-testid={`size-${size}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="font-heading font-semibold text-[#1A1A1A] mb-3">Quantity</h3>
              {(() => {
                // Get stock based on selected variation or size
                const currentStock = getCurrentStock();
                
                return (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        data-testid="qty-minus"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-6 font-medium text-lg" data-testid="qty-value">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        data-testid="qty-plus"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <span className={`${currentStock < 10 ? 'text-orange-500 font-medium' : 'text-[#6B7280]'}`}>
                      {currentStock} available
                      {currentStock < 10 && currentStock > 0 && ' - Hurry!'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Add to Cart & Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-3">
              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || getCurrentStock() === 0 || product.is_sold_out}
                className={`flex-1 rounded-lg py-6 text-lg font-medium ${
                  getCurrentStock() === 0 || product.is_sold_out
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white'
                }`}
                data-testid="add-to-cart-btn"
              >
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </span>
                ) : getCurrentStock() === 0 || product.is_sold_out ? (
                  <span className="flex items-center gap-2">
                    Out of Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </span>
                )}
              </Button>
              
              {/* Wishlist Button */}
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                className={`px-4 py-6 rounded-lg border-2 transition-all ${
                  inWishlist 
                    ? "border-red-500 bg-red-50 text-red-500" 
                    : "border-gray-200 hover:border-red-500 hover:text-red-500"
                }`}
                data-testid="wishlist-btn"
              >
                <Heart className={`w-6 h-6 ${inWishlist ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Order on WhatsApp Button - replaces the old direct "Buy Now" flow */}
            {whatsappSettings?.ordering_enabled && whatsappSettings?.show_on_product_page && whatsappSettings?.notify_number ? (
              <Button
                onClick={handleOrderOnWhatsApp}
                disabled={getCurrentStock() === 0 || product.is_sold_out}
                className={`w-full rounded-lg py-6 text-lg font-medium mb-6 flex items-center justify-center gap-2 ${
                  getCurrentStock() === 0 || product.is_sold_out
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#25D366] hover:bg-[#1ebe5a] text-white'
                }`}
                data-testid="order-whatsapp-btn"
              >
                {getCurrentStock() === 0 || product.is_sold_out ? 'Out of Stock' : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.096.547 4.14 1.587 5.945L0 24l6.192-1.562A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.79 0-3.545-.475-5.086-1.375l-.365-.213-3.674.928.98-3.583-.238-.375A9.777 9.777 0 012.182 12C2.182 6.585 6.585 2.182 12 2.182S21.818 6.585 21.818 12 17.415 21.818 12 21.818z"/></svg>
                    Order on WhatsApp
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => {
                    window.location.href = '/checkout';
                  }, 500);
                }}
                disabled={getCurrentStock() === 0 || product.is_sold_out}
                className={`w-full rounded-lg py-6 text-lg font-medium mb-6 ${
                  getCurrentStock() === 0 || product.is_sold_out
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#1A1A1A] hover:bg-[#333] text-white'
                }`}
                data-testid="buy-now-btn"
              >
                {getCurrentStock() === 0 || product.is_sold_out ? 'Out of Stock' : 'Buy It Now'}
              </Button>
            )}

            {/* Delivery & Services - Right after Buy It Now */}
            <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3">How you will get this item</h3>
              <div className="flex gap-2">
                {/* Shipping */}
                <div className="flex-1 p-2 bg-blue-50 rounded-lg text-center">
                  <Truck className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#1A1A1A]">Shipping</p>
                  <p className="text-[10px] text-green-600">{deliveryInfo.shipping_text}</p>
                </div>
                {/* COD */}
                <div className="flex-1 p-2 bg-green-50 rounded-lg text-center">
                  <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#1A1A1A]">COD</p>
                  <p className="text-[10px] text-green-600">{deliveryInfo.cod_text}</p>
                </div>
                {/* Returns */}
                <div className="flex-1 p-2 bg-orange-50 rounded-lg text-center">
                  <RotateCcw className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#1A1A1A]">Returns</p>
                  <p className="text-[10px] text-orange-600">{product.warranty || deliveryInfo.returns_text}</p>
                </div>
              </div>
            </div>

            {/* Share Buttons Row */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
              <span className="text-gray-500 text-sm">Share:</span>
              <button
                onClick={() => handleShare('copy')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Copy link"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                title="Share on WhatsApp"
              >
                <Send className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
              </button>
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-purple-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* You Might Also Like - ABOVE Product Details */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">
                You Might Also Like
              </h2>
              <Link to={`/products?category=${product.category}`} className="text-[#FF8FAB] hover:underline text-sm font-medium">
                View All →
              </Link>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relProduct) => (
                  <Link 
                    key={relProduct.product_id} 
                    to={`/product/${relProduct.product_id}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img 
                        src={relProduct.image_url} 
                        alt={relProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Popular Badge - Dynamic from Admin */}
                      {getPopularityBadgeText(relProduct.product_id) && (
                        <div className="absolute top-2 left-2 bg-[#FF8FAB] text-white text-[10px] px-2 py-1 rounded-full font-medium">
                          {getPopularityBadgeText(relProduct.product_id)}
                        </div>
                      )}
                      
                      {/* Quick Add Button */}
                      <button 
                        className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF8FAB] hover:text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(relProduct.product_id, 1);
                          toast.success("Added to cart!");
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-[#1A1A1A] text-sm line-clamp-2 mb-2 group-hover:text-[#FF8FAB] transition-colors">
                        {relProduct.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                          <span>{relProduct.rating || 4.5}</span>
                          <Star className="w-3 h-3 ml-0.5 fill-current" />
                        </div>
                        <span className="text-xs text-gray-400">(50+)</span>
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FF8FAB]">
                          Rs. {relProduct.discount_price || relProduct.price}
                        </span>
                        {relProduct.discount_price && (
                          <span className="text-xs text-gray-400 line-through">
                            Rs. {relProduct.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Details Section - Full Description (Daraz Style Footer) */}
        <div id="product-details-section" className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-[#FF8FAB] rounded-full"></span>
            Product Details
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Full Description */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-[#1A1A1A] mb-4">Description</h3>
              <div className="prose prose-gray max-w-none">
                <div 
                  className="text-gray-600 leading-relaxed product-description"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                />
              </div>
            </div>

            {/* Product Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-4">Product Highlights</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {product.highlights.map((highlight, index) => {
                    const text = typeof highlight === 'string' ? highlight : highlight.text;
                    const isBold = typeof highlight === 'object' && highlight.bold;
                    return (
                      <li key={index} className={isBold ? 'font-bold text-[#1A1A1A]' : 'text-gray-600'}>
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Custom Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-4">Specifications</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {product.specifications.map((spec, index) => {
                    // Handle string, object with text/bold, and old {name, value} format
                    const text = typeof spec === 'string' 
                      ? spec 
                      : (spec.text || spec.value || `${spec.name}: ${spec.value}`);
                    const isBold = typeof spec === 'object' && spec.bold;
                    return (
                      <li key={index} className={`text-gray-600 ${isBold ? 'font-bold text-[#1A1A1A]' : ''}`}>
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Additional Details - Walmart Style */}
            <div className="p-6">
              <h3 className="font-semibold text-lg text-[#1A1A1A] mb-4">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Device Specifications - Show if product has device_specs */}
                {product.device_specs && (
                  <>
                    {product.device_specs.brand && (
                      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
                        <p className="text-xs text-pink-600 mb-1 font-medium">🏷️ Brand</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.brand}</p>
                      </div>
                    )}
                    {product.device_specs.color && (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1 font-medium">🎨 Color</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.color}</p>
                      </div>
                    )}
                    {product.device_specs.ram && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1 font-medium">💾 RAM</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.ram}</p>
                      </div>
                    )}
                    {product.device_specs.storage && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-600 mb-1 font-medium">💿 Storage</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.storage}</p>
                      </div>
                    )}
                    {product.device_specs.processor && (
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1 font-medium">⚡ Processor</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.processor}</p>
                      </div>
                    )}
                    {product.device_specs.condition && (
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-1 font-medium">✓ Condition</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.condition}</p>
                      </div>
                    )}
                    {product.device_specs.warranty && (
                      <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                        <p className="text-xs text-cyan-600 mb-1 font-medium">🛡️ Warranty</p>
                        <p className="font-bold text-[#1A1A1A]">{product.device_specs.warranty}</p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Brand Name - Use device_specs.brand if available */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Brand Name</p>
                  <p className="font-medium text-[#1A1A1A]">{product.device_specs?.brand || product.brand || 'T For Tech'}</p>
                </div>
                
                {/* Weight */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Product Weight</p>
                  <p className="font-medium text-[#1A1A1A]">{product.weight || 'N/A'}</p>
                </div>
                
                {/* Dimensions */}
                {product.dimensions && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Dimensions</p>
                    <p className="font-medium text-[#1A1A1A]">{product.dimensions}</p>
                  </div>
                )}
                
                {/* Returns/Warranty */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Returns/Warranty</p>
                  <p className="font-medium text-[#1A1A1A]">{product.device_specs?.warranty || product.warranty || 'Free 30-day returns'}</p>
                </div>
                
                {/* Stock Status */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Availability</p>
                  <p className={`font-medium ${getCurrentStock() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getCurrentStock() > 0 ? `In Stock (${getCurrentStock()} available)` : 'Out of Stock'}
                  </p>
                </div>
                
                {/* SKU - From Admin Panel */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">SKU</p>
                  <p className="font-medium text-[#1A1A1A]">{product.sku || product.product_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-2xl font-bold text-[#1A1A1A]">
                Ratings & Reviews
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-500 text-white px-2 py-1 rounded">
                  <span className="font-semibold">{averageRating}</span>
                  <Star className="w-4 h-4 ml-1 fill-current" />
                </div>
                <span className="text-gray-500 text-sm">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            
            {isAuthenticated && !showReviewForm && (
              <Button
                onClick={() => setShowReviewForm(true)}
                variant="outline"
                className="border-[#FF8FAB] text-[#FF8FAB] hover:bg-[#FF8FAB]/10"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Write Your Review</h3>
              
              {/* Star Rating Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  onClick={() => setShowReviewForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.review_id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1A1A1A]">{review.user_name}</span>
                        <div className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">
                          <span>{review.rating}</span>
                          <Star className="w-3 h-3 ml-1 fill-current" />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button className="mt-4 bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white">
                    Login to Write a Review
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
