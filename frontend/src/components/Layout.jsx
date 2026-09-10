import { Link, useNavigate } from "react-router-dom";
import { useAuth, useCart } from "../App";
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, Heart, ChevronDown } from "lucide-react";
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
        // Show all parent categories in nav dropdown
        const parentCategories = response.data
          .filter(cat => !cat.parent_id);
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
              <span style={{color: 'var(--color-primary)'}}>T</span>
              <span style={{color: 'var(--color-text)'}}>For Tech</span>
            </span>
          </Link>

          {/* Desktop Navigation - Categories Dropdown */}
          <div className="hidden md:flex items-center gap-8">
            {navCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1 hover:opacity-80 transition-colors font-medium"
                    style={{color: 'var(--color-text)'}}
                    data-testid="nav-categories-dropdown"
                  >
                    Categories
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
                  {navCategories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link
                        to={`/products/${category.id}`}
                        className="w-full cursor-pointer"
                        data-testid={`nav-${category.id}`}
                      >
                        {category.icon ? `${category.icon} ` : ""}{category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                <span className="absolute -top-1 -right-1 bg-[#3B82F6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
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
                  className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white rounded-full px-6 btn-hover-lift"
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
                  className="text-[#1A1A1A] hover:text-[#3B82F6] font-medium py-2"
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
                <span style={{color: 'var(--color-primary)'}}>T</span>
                <span className="text-white">For Tech</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {siteContent?.footer_description || "Express your unique style with our collection of standout handbags. From the must-have classics to this season's conversation pieces, find the perfect accent to define your look."}
            </p>
                <div className="flex items-center gap-3 mt-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD166] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD166] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76a4.9 4.9 0 0 1 1.76-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.66.31-.42.16-.72.36-1.03.67-.31.31-.51.61-.67 1.03-.13.32-.27.79-.31 1.66-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.87.18 1.34.31 1.66.16.42.36.72.67 1.03.31.31.61.51 1.03.67.32.13.79.27 1.66.31 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.66-.31.42-.16.72-.36 1.03-.67.31-.31.51-.61.67-1.03.13-.32.27-.79.31-1.66.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.87-.18-1.34-.31-1.66a2.76 2.76 0 0 0-.67-1.03 2.76 2.76 0 0 0-1.03-.67c-.32-.13-.79-.27-1.66-.31-1.05-.05-1.37-.06-4.04-.06Zm0 3.06a5.14 5.14 0 1 1 0 10.28 5.14 5.14 0 0 1 0-10.28Zm0 1.8a3.34 3.34 0 1 0 0 6.68 3.34 3.34 0 0 0 0-6.68Zm5.34-1.99a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/></svg>
                  </a>
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD166] transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82c-.83-.9-1.29-2.07-1.29-3.32h-3.06v13.7a2.9 2.9 0 1 1-2.07-2.78V10.3a5.94 5.94 0 1 0 5.13 5.9V9.35a7.02 7.02 0 0 0 4.09 1.31V7.6a4.1 4.1 0 0 1-2.8-1.78Z"/></svg>
                  </a><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFD166] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.37.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.37-.56a3.02 3.02 0 0 0 2.13-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg></a>
                </div>
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
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li><li><Link to="/track-order" className="text-gray-400 hover:text-white transition-colors">Track Order</Link>
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
              <li>📧 {siteContent?.contact_email || "arslanchaudhry01786@gmail.com"}</li>
              <li>📞 {siteContent?.contact_phone || "0306 0634634"}</li>
              <li>📍 {siteContent?.contact_address || "Lahore, Pakistan"}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>© 2025 T For Tech. All rights reserved.</p>
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
};const WhatsAppButton = () => { const { cart } = useCart(); const items = (cart && cart.items) || []; const message = items.length > 0 ? "Hi! Main ye order karna chahta hoon:\n" + items.map((item) => item.name + " x" + item.quantity + " - Rs. " + ((item.discount_price || item.price) * item.quantity)).join("\n") + "\n\nTotal: Rs. " + cart.total : "Hi! Mujhe apke products ke baare mein maloomat chahiye."; const waLink = "https://wa.me/923033424333?text=" + encodeURIComponent(message); return (<a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" style={{ position: "fixed", bottom: "24px", right: "24px", width: "60px", height: "60px", background: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.3)", zIndex: 9999, }}><svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M16.001 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.258.594 4.376 1.632 6.213L3.2 28.8l6.77-1.605A12.73 12.73 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.8-12.799-12.8Zm0 23.36a10.5 10.5 0 0 1-5.36-1.47l-.384-.228-4.017.953.973-3.914-.25-.402A10.51 10.51 0 0 1 5.44 16c0-5.83 4.73-10.56 10.561-10.56S26.56 10.17 26.56 16 21.831 26.56 16.001 26.56Zm5.786-7.86c-.317-.159-1.874-.925-2.165-1.03-.29-.106-.502-.159-.713.159-.211.317-.818 1.03-1.003 1.242-.185.211-.37.238-.687.08-.317-.16-1.337-.493-2.547-1.572-.941-.84-1.577-1.878-1.762-2.195-.185-.317-.02-.489.139-.647.143-.142.318-.37.476-.556.159-.185.212-.317.318-.529.106-.211.053-.396-.026-.555-.08-.159-.713-1.718-.977-2.353-.257-.618-.518-.534-.713-.544l-.607-.011c-.211 0-.555.079-.846.396-.29.317-1.108 1.083-1.108 2.642s1.134 3.064 1.292 3.276c.159.211 2.232 3.406 5.406 4.777.755.326 1.345.52 1.805.665.758.241 1.448.207 1.994.126.608-.09 1.874-.766 2.139-1.507.264-.74.264-1.375.185-1.508-.08-.132-.29-.211-.607-.37Z"/></svg></a>); };const CookieConsent = () => { const [visible, setVisible] = useState(() => !localStorage.getItem("cookie_consent")); if (!visible) return null; const accept = () => { localStorage.setItem("cookie_consent", "accepted"); setVisible(false); }; return (<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1A1A", color: "#fff", padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", zIndex: 9998, paddingRight: "90px", boxShadow: "0 -4px 14px rgba(0,0,0,0.2)" }}><span style={{ fontSize: "14px" }}>We use cookies to improve your experience. By using this site, you agree to our cookie policy.</span><button onClick={accept} style={{ background: "#3B82F6", color: "#fff", border: "none", borderRadius: "9999px", padding: "8px 20px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>Accept</button></div>); };export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative" style={{backgroundColor: 'var(--color-background)'}}>
      <Watermark />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
        <WhatsAppButton /><CookieConsent />
    </div>
  );
}
