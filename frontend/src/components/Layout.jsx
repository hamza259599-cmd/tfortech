import { Link, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "../App";
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        // Get only parent categories (no parent_id) and limit to 5 for navbar
        const parentCategories = response.data
          .filter(cat => !cat.parent_id)
          .slice(0, 5);
        setNavCategories(parentCategories);
      } catch (error) {
        console.error("Error fetching nav categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <span className="font-heading text-2xl font-bold">
              <span style={{color: 'var(--color-primary)'}}>Go</span>
              <span style={{color: 'var(--color-text)'}}>Juniors</span>
            </span>
          </Link>

          {/* Desktop Navigation - Dynamic Categories */}
          <div className="hidden md:flex items-center gap-8">
            {navCategories.map((category) => (
              <Link 
                key={category.id}
                to={`/products/${category.id}`} 
                className="hover:opacity-80 transition-colors font-medium"
                style={{color: 'var(--color-text)'}}
                data-testid={`nav-${category.id}`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="relative p-2 hover:bg-red-50 rounded-full transition-colors"
              data-testid="nav-wishlist"
            >
              <Heart className="w-6 h-6 text-[#1A1A1A] hover:text-red-500" />
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-[#FFD166]/20 rounded-full transition-colors"
              data-testid="nav-cart"
            >
              <ShoppingCart className="w-6 h-6 text-[#1A1A1A]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF8FAB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 hover:bg-[#FFD166]/20"
                    data-testid="nav-user-menu"
                  >
                    {user?.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{user?.name?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-orders">
                    <Package className="w-4 h-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  {user?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  className="bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 text-white rounded-full px-6 btn-hover-lift"
                  data-testid="nav-login"
                >
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Dynamic Categories */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              {navCategories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/products/${category.id}`} 
                  className="text-[#1A1A1A] hover:text-[#FF8FAB] font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Footer = () => {
  const [footerCategories, setFooterCategories] = useState([]);
  const [siteContent, setSiteContent] = useState(null);

  // Fetch categories dynamically for footer
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        // Get only parent categories and limit to 5 for footer
        const parentCategories = response.data
          .filter(cat => !cat.parent_id)
          .slice(0, 5);
        setFooterCategories(parentCategories);
      } catch (error) {
        console.error("Error fetching footer categories:", error);
      }
    };
    fetchCategories();

    // Fetch site content for contact info
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API}/settings/content`);
        setSiteContent(response.data);
      } catch (error) {
        console.error("Error fetching site content:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <footer style={{backgroundColor: 'var(--color-text)'}} className="text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="font-heading text-2xl font-bold">
                <span style={{color: 'var(--color-primary)'}}>Go</span>
                <span className="text-white">Juniors</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {siteContent?.footer_description || "Express your unique style with our collection of standout handbags. From the must-have classics to this season's conversation pieces, find the perfect accent to define your look."}
            </p>
          </div>

          {/* Quick Links - Dynamic */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/products/${category.id}`} 
                    className="text-gray-400 transition-colors"
                    style={{'--hover-color': 'var(--color-primary)'}}
                    onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.target.style.color = ''}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Pages */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact - Dynamic */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 {siteContent?.contact_email || "info@gojuniors.com"}</li>
              <li>📞 {siteContent?.contact_phone || "0306 0634634"}</li>
              <li>📍 {siteContent?.contact_address || "Lahore, Pakistan"}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© 2025 GoJuniors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Watermark Component
const Watermark = () => {
  const [watermark, setWatermark] = useState(null);

  useEffect(() => {
    const fetchWatermark = async () => {
      try {
        const response = await axios.get(`${API}/settings/theme`);
        if (response.data.watermark_text || response.data.watermark_image) {
          setWatermark(response.data);
        }
      } catch (error) {
        console.error("Error fetching watermark:", error);
      }
    };
    fetchWatermark();
  }, []);

  if (!watermark || (!watermark.watermark_text && !watermark.watermark_image)) {
    return null;
  }

  const getPositionStyles = () => {
    const pos = watermark.watermark_position || "center";
    const styles = {
      position: "fixed",
      pointerEvents: "none",
      zIndex: 0,
    };

    if (pos.includes("top")) styles.top = "20%";
    else if (pos.includes("bottom")) styles.bottom = "20%";
    else styles.top = "50%";

    if (pos.includes("left")) styles.left = "10%";
    else if (pos.includes("right")) styles.right = "10%";
    else { styles.left = "50%"; styles.transform = "translateX(-50%)"; }

    if (pos === "center") styles.transform = "translate(-50%, -50%)";

    return styles;
  };

  return (
    <div style={getPositionStyles()}>
      {watermark.watermark_image ? (
        <img 
          src={watermark.watermark_image} 
          alt="Watermark"
          style={{ 
            opacity: watermark.watermark_opacity || 0.1,
            maxWidth: "300px",
            maxHeight: "300px"
          }}
        />
      ) : watermark.watermark_text ? (
        <span 
          style={{ 
            opacity: watermark.watermark_opacity || 0.1,
            fontSize: "4rem",
            fontWeight: "bold",
            color: "var(--color-text)",
            userSelect: "none"
          }}
        >
          {watermark.watermark_text}
        </span>
      ) : null}
    </div>
  );
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative" style={{backgroundColor: 'var(--color-background)'}}>
      <Watermark />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
