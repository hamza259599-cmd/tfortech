import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";

// Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pages (lazy imports would be better but keeping simple for now)
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminUsers from "./pages/admin/AdminUsers";
import ProductPublish from "./pages/admin/ProductPublish";
import DataTransfer from "./pages/admin/DataTransfer";
import ThemeSettings from "./pages/admin/ThemeSettings";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminReviews from "./pages/admin/AdminReviews";
import CategoriesPage from "./pages/CategoriesPage";
import SiteContent from "./pages/admin/SiteContent";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminHeroDeals from "./pages/admin/AdminHeroDeals";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminReviewVideos from "./pages/admin/AdminReviewVideos";
import AdminHeroSettings from "./pages/admin/AdminHeroSettings";
import WhatsAppSettings from "./pages/admin/WhatsAppSettings";
import VisitorTracker from "./components/VisitorTracker";

// Scroll to Top Component - ensures page starts from top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Auth Callback Component
const AuthCallback = () => {
  const hasProcessed = useRef(false);
  const { setUser, setIsAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");

      if (sessionId) {
        try {
          const response = await axios.post(`${API}/auth/session`, { session_id: sessionId });
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
          }
          setUser(response.data);
          setIsAuthenticated(true);
          window.location.href = "/";
        } catch (error) {
          console.error("Auth error:", error);
          window.location.href = "/login";
        }
      }
    };

    processAuth();
  }, [location, setUser, setIsAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent mx-auto mb-4"></div>
        <p className="font-heading text-lg">Logging you in...</p>
      </div>
    </div>
  );
};

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/" />;
  }

  return children;
};

// App Router
function AppRouter() {
  const location = useLocation();

  // Check for session_id in hash - synchronous check before render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <>
      <ScrollToTop />
      <VisitorTracker />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:category" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><ProductPublish /></ProtectedRoute>} />
      <Route path="/admin/products/edit/:id" element={<ProtectedRoute adminOnly><ProductPublish /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/shipping" element={<ProtectedRoute adminOnly><AdminShipping /></ProtectedRoute>} />
      <Route path="/admin/theme" element={<ProtectedRoute adminOnly><ThemeSettings /></ProtectedRoute>} />
      <Route path="/admin/data-transfer" element={<ProtectedRoute adminOnly><DataTransfer /></ProtectedRoute>} />
      <Route path="/admin/gallery" element={<ProtectedRoute adminOnly><AdminGallery /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute adminOnly><SiteContent /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/deals" element={<ProtectedRoute adminOnly><AdminDeals /></ProtectedRoute>} />
      <Route path="/admin/hero-deals" element={<ProtectedRoute adminOnly><AdminHeroDeals /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/testimonials" element={<ProtectedRoute adminOnly><AdminTestimonials /></ProtectedRoute>} />
      <Route path="/admin/review-videos" element={<ProtectedRoute adminOnly><AdminReviewVideos /></ProtectedRoute>} />
      <Route path="/admin/hero" element={<ProtectedRoute adminOnly><AdminHeroSettings /></ProtectedRoute>} />
      <Route path="/admin/whatsapp" element={<ProtectedRoute adminOnly><WhatsAppSettings /></ProtectedRoute>} />
      <Route path="/admin/campaigns" element={<ProtectedRoute adminOnly><AdminCampaigns /></ProtectedRoute>} />
    </Routes>
    </>
  );
}

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    setUser(response.data);
    setIsAuthenticated(true);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    setUser(response.data);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch (e) {}
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const googleLogin = () => {
    // Google login previously went through Emergent's hosted auth proxy, which no longer
    // applies now that this app runs independently. Needs its own Google OAuth client
    // (Google Cloud Console) before this can be re-enabled. Email/password login below
    // works fully in the meantime.
    alert('Google login is temporarily unavailable. Please use email and password to sign in.');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated, loading, login, register, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Cart Provider
function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API}/cart`);
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1, size = null) => {
    try {
      await axios.post(`${API}/cart/add`, { product_id: productId, quantity, size });
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API}/cart/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(`${API}/cart/${productId}`, { product_id: productId, quantity });
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart`);
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Theme Provider - Fetches and applies theme colors
function ThemeProvider({ children }) {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get(`${API}/settings/theme`);
        const theme = response.data;
        
        // Apply theme colors as CSS variables
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.primary_color || '#FF8FAB');
        root.style.setProperty('--color-secondary', theme.secondary_color || '#FFD166');
        root.style.setProperty('--color-accent', theme.accent_color || '#06D6A0');
        root.style.setProperty('--color-text', theme.text_color || '#1A1A1A');
        root.style.setProperty('--color-background', theme.background_color || '#FDFBF7');
        root.style.setProperty('--color-button-text', theme.button_text_color || '#FFFFFF');
        
        // Also set body background
        document.body.style.backgroundColor = theme.background_color || '#FDFBF7';

                // Cache theme so next reload applies it instantly (no pink flash)
                localStorage.setItem('tfortech_theme', JSON.stringify(theme));
                const metaTag = document.querySelector('meta[name="theme-color"]');
                if (metaTag) metaTag.setAttribute('content', theme.primary_color || '#FF8FAB');
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };
    fetchTheme();
  }, []);

  return children;
}

function App() {
  // Seed data on first load
  useEffect(() => {
    const seedData = async () => {
      try {
        await axios.post(`${API}/seed`);
      } catch (error) {
        // Silently fail if already seeded
      }
    };
    seedData();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <HelmetProvider>
              <AppRouter />
              <Toaster position="top-right" richColors />
            </HelmetProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
