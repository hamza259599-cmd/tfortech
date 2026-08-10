import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Box, Tags, ClipboardList, Users, Truck, Palette, FileText, Image, Star, TrendingUp, Megaphone, Zap, Video, GalleryHorizontal } from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const linkClass = (path) => {
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${
      isActive(path)
        ? "bg-[#FF8FAB]/10 text-[#FF8FAB] font-medium"
        : "text-[#6B7280] hover:bg-gray-100"
    }`;
  };

  return (
    <aside className="w-64 bg-white min-h-[calc(100vh-64px)] border-r border-gray-200 hidden lg:block">
      <nav className="p-4">
        {/* Main Menu Section */}
        <div className="px-4 py-2 mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</h3>
        </div>
        <Link to="/admin" className={linkClass("/admin")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link to="/admin/analytics" className={linkClass("/admin/analytics")}>
          <TrendingUp className="w-5 h-5" />
          Visitor Analytics
        </Link>
        <Link to="/admin/campaigns" className={linkClass("/admin/campaigns")}>
          <Megaphone className="w-5 h-5" />
          Ad Campaigns
        </Link>
        <Link to="/admin/products" className={linkClass("/admin/products")}>
          <Box className="w-5 h-5" />
          Products
        </Link>
        <Link to="/admin/categories" className={linkClass("/admin/categories")}>
          <Tags className="w-5 h-5" />
          Categories
        </Link>
        <Link to="/admin/orders" className={linkClass("/admin/orders")}>
          <ClipboardList className="w-5 h-5" />
          Orders
        </Link>
        <Link to="/admin/deals" className={linkClass("/admin/deals")}>
          <Zap className="w-5 h-5" />
          Flash Deals
        </Link>
        <Link to="/admin/review-videos" className={linkClass("/admin/review-videos")}>
          <Video className="w-5 h-5" />
          Review Videos
        </Link>
        <Link to="/admin/hero" className={linkClass("/admin/hero")}>
          <GalleryHorizontal className="w-5 h-5" />
          Hero Section
        </Link>
        <Link to="/admin/reviews" className={linkClass("/admin/reviews")}>
          <Star className="w-5 h-5" />
          Reviews
        </Link>
        <Link to="/admin/users" className={linkClass("/admin/users")}>
          <Users className="w-5 h-5" />
          Users
        </Link>

        <Link to="/admin/gallery" className={linkClass("/admin/gallery")}>
          <Image className="w-5 h-5" />
          Gallery
        </Link>

        {/* Settings Section */}
        <div className="px-4 py-2 mt-6 mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
        </div>
        <Link to="/admin/content" className={linkClass("/admin/content")}>
          <FileText className="w-5 h-5" />
          Site Content
        </Link>
        <Link to="/admin/theme" className={linkClass("/admin/theme")}>
          <Palette className="w-5 h-5" />
          Theme Colors
        </Link>
        <Link to="/admin/shipping" className={linkClass("/admin/shipping")}>
          <Truck className="w-5 h-5" />
          Shipping
        </Link>
      </nav>
    </aside>
  );
}
