# GoJuniors E-commerce Platform - PRD

## Original Problem Statement
Build a professional, fully functional e-commerce website named "GoJuniors" for kids' clothes, toys, and educational items. The entire website should be fully dynamic, with all content (categories, products, text, colors, banners, informational pages) managed from an admin panel, minimizing the need for future code changes.

## Core Requirements
- **Application Name:** GoJuniors
- **Products:** Kids' clothes, toys, educational items, bags, watches
- **Payment:** Cash on Delivery (COD) only
- **Currency:** Pakistani Rupee (PKR)
- **Authentication:** JWT-based custom auth + Google social login
- **Admin Panel:** Full content management for products, categories, orders, users, site content, theme

## What's Been Implemented

### January 2026 - Session Updates

#### February 2026 - Latest Updates
- ✅ **Warranty Feature Complete** - Added fully dynamic warranty section to Mobile/Laptop Config page
  - Add/Edit/Delete custom warranty periods (1-30 days, months, years)
  - Quick add buttons for common periods (Days, Months, Years, Special options)
  - Description field for each warranty option
  - Preview badge shown in the list
  - Summary card updated to show warranty count
- ✅ **Device Specs Integration in Product Publish** - When "Mobiles" or "Laptops" category is selected:
  - Dynamic dropdowns appear: Brand, Color, RAM, Storage, Processor, Condition, Warranty
  - Description Preset dropdown auto-fills product description
  - Selected specs shown as badges
  - All data saved with the product as `device_specs`
- ✅ **Device Config Editor Inline** - "Edit Options" button opens config editor directly in Product Publish page
  - Full Mobile/Laptop Config functionality available inline
  - Add/Edit/Delete Brands, Colors, RAM, Storage, Processors, Conditions, Warranties, Descriptions
  - Collapsible sections with counts
  - Quick add buttons for common values
  - Save Config button to persist changes
- ✅ **SEO Implementation** - Dynamic meta tags, sitemap.xml, robots.txt
- ✅ **Visitor Analytics Dashboard** - Track unique visitors, device types, visits chart
- ✅ **Ad Campaign Tracking** - UTM parameter tracking, conversions, performance chart
- ✅ **Dynamic Popularity Badge** - Admin-controlled promotional badges on products

#### Bug Fixes (Latest)
- ✅ **Category Images Fixed** - Updated broken images for Women Bags, watchs, Crossbody Bags with Unsplash URLs
- ✅ **Category ID Display Fixed** - Product Detail page & Product Cards now show category names instead of IDs
- ✅ **Scroll to Top** - Pages now start from top on navigation/refresh
- ✅ **Empty Category Handling** - Subcategories show parent category products when empty
- ✅ **"0 items" Hidden** - Categories with no products don't display "0 items"
- ✅ **Friendly Empty State** - Changed "No products found" to "Coming Soon!" message

#### Dynamic Content Management
- ✅ Homepage Hero Section (Title, Subtitle, BG Image)
- ✅ Static Pages: About Us, Contact, FAQ, Terms, Privacy Policy
- ✅ Service Banners (Free Delivery, Quality Guarantee)
- ✅ Product Page Delivery Info
- ✅ Footer Contact Information
- ✅ Theme Colors via CSS Variables
- ✅ Watermark Feature (text/image overlay)

#### Admin Features
- ✅ Site Content Management Page (`/admin/content`)
- ✅ Gallery Page (`/admin/gallery`)
- ✅ Theme Settings with Watermark
- ✅ Category Management with Reordering

#### Frontend UX
- ✅ Product Cards with hover actions (Cart, Wishlist, View)
- ✅ Dedicated Categories Page (`/categories`)
- ✅ Pagination on Products API & Page
- ✅ Lazy Loading for Images

## Architecture

```
/app/
├── backend/
│   └── server.py         # Main API server (needs refactoring)
└── frontend/
    └── src/
        ├── components/
        │   ├── AdminSidebar.jsx
        │   ├── Layout.jsx (with watermark & footer)
        │   └── ProductCard.jsx (with category name lookup)
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── ProductsPage.jsx (with parent category fallback)
        │   ├── ProductDetailPage.jsx (with category lookup)
        │   ├── CategoriesPage.jsx
        │   └── admin/
        │       ├── SiteContent.jsx
        │       ├── ThemeSettings.jsx
        │       └── AdminGallery.jsx
        └── App.js (with ScrollToTop)
```

## Key API Endpoints
- `GET/POST /api/settings/content` - Site content management
- `GET/POST /api/settings/theme` - Theme & watermark settings
- `GET /api/products` - Products with pagination (?page=&limit=)
- `GET/POST/DELETE /api/gallery` - Image gallery CRUD
- `POST /api/admin/categories/reorder` - Category reordering

## Database Collections
- `products` - Product catalog
- `categories` - Category hierarchy
- `orders` - Customer orders
- `users` - User accounts
- `site_content` - Dynamic text/content
- `theme_settings` - Colors, watermark
- `gallery_images` - Uploaded images

## Prioritized Backlog

### P0 - High Priority
- 🔴 CORS/Deployment Issue - Live site has backend crash issues (net::ERR_FAILED 520)

### P1 - Medium Priority
- ✅ ~~Integrate Device Configs with ProductPublish~~ - COMPLETED Feb 2026
- 🚚 Free Shipping Threshold - Make configurable from admin
- 📊 Google Sheets Integration - Auto-sync products
- 🔍 JSON-LD Structured Data - Fix SEO implementation for products

### P2 - Low Priority
- Code Refactoring - Break down server.py into routes/models/services
- Component Decomposition - Split large components
- 🖼️ Broken Product Images - Fix old URLs in database

## Credentials
- **Admin:** admin@gojuniors.com / admin123

## SEO Implementation (January 29, 2026)

### Completed SEO Features
- ✅ **Dynamic Meta Tags** - Using `react-helmet-async` for page-specific titles and descriptions
- ✅ **SEO Component** - Reusable `<SEO>` component at `/app/frontend/src/components/SEO.jsx`
- ✅ **robots.txt** - Available at `/robots.txt` (served from frontend public folder)
- ✅ **sitemap.xml** - Dynamic sitemap at `/api/sitemap.xml` with all products, categories, and static pages
- ✅ **Open Graph Tags** - For Facebook/social media sharing
- ✅ **Twitter Cards** - For Twitter sharing
- ✅ **Canonical URLs** - Properly set for all pages
- ✅ **Geo Targeting** - Pakistan region meta tags
- ✅ **Default Meta in index.html** - Fallback SEO meta tags in HTML

### Pages with SEO Integration
- HomePage, ProductDetailPage, ProductsPage, CategoriesPage
- AboutPage, ContactPage, FAQPage, TermsPage, PrivacyPage

### SEO Endpoints
- `GET /api/sitemap.xml` - Dynamic XML sitemap with all URLs
- `GET /api/robots.txt` - Robots directives (also available at /robots.txt)

### Google Search Console Steps
1. Submit sitemap: `https://gojuniors.com/api/sitemap.xml`
2. Request indexing for homepage and key product pages
3. Monitor "Crawled - currently not indexed" status

## Notes
- User communicates in Hinglish - respond accordingly
- Preview vs Live site confusion - always clarify which environment
- Old image URLs from previous domain may need updating
- **Deploy changes** to production via "Save to Github" for SEO to take effect on live site
