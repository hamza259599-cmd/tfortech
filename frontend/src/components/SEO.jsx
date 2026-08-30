import { Helmet } from "react-helmet-async";

/**
 * SEO Component - Dynamic meta tags for each page
 * Covers traditional SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization)
 */
export default function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = "website",
  product = null, // For product pages
  breadcrumbs = null // Optional: [{ name, url }] for BreadcrumbList schema
}) {
  const siteName = "T For Tech";
    const defaultDescription = "Shop the latest tech and gadgets at T For Tech. Quality products with Cash on Delivery across Pakistan.";
    const defaultImage = "https://tfortech.store/logo.png";
    const baseUrl = "https://tfortech.store";

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const fullDescription = description || defaultDescription;
    const fullImage = image || defaultImage;
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

  // Product structured data for JSON-LD
  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.meta_description || product.description?.replace(/<[^>]*>/g, '') || fullDescription,
    "image": product.image_url || product.image_urls?.[0] || fullImage,
    "sku": product.product_id,
    "brand": {
      "@type": "Brand",
      "name": siteName
    },
    "offers": {
      "@type": "Offer",
      "url": fullUrl,
      "priceCurrency": "PKR",
      "price": product.discount_price || product.price,
      "availability": product.is_sold_out || product.stock === 0 
        ? "https://schema.org/OutOfStock" 
        : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": siteName
      }
    }
  } : null;

  // Add aggregate rating only if product has ratings
  if (productSchema && product?.rating > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.review_count || 1
    };
  }

  // Organization structured data (helps AI/answer engines identify the business)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": baseUrl,
    "logo": defaultImage,
    "description": "T For Tech is a Pakistan-based online store selling laptops, computers, and tech accessories with Cash on Delivery nationwide.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-306-0634634",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["en", "ur"]
    },
    "sameAs": []
  };

  // WebSite structured data with SearchAction (enables sitelinks search box, helps AI understand search capability)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // BreadcrumbList structured data (helps both search engines and AI understand page hierarchy)
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.name,
      "item": b.url ? `${baseUrl}${b.url}` : undefined
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(product ? productSchema : organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
