import { Helmet } from "react-helmet-async";

/**
 * SEO Component - Dynamic meta tags for each page
 */
export default function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = "website",
  product = null // For product pages
}) {
  const siteName = "GoJuniors";
  const defaultDescription = "Shop kids' clothes, toys, and educational items at GoJuniors. Quality products with Cash on Delivery across Pakistan.";
  const defaultImage = "https://gojuniors.com/logo.png";
  const baseUrl = "https://gojuniors.com";
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || defaultDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

  // Product structured data for JSON-LD
  const productSchema = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description?.replace(/<[^>]*>/g, '') || fullDescription,
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

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": baseUrl,
    "logo": defaultImage,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-306-0634634",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["en", "ur"]
    },
    "sameAs": []
  };

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
      
      {/* Structured Data (JSON-LD) - Product or Organization */}
      <script type="application/ld+json">
        {JSON.stringify(product ? productSchema : organizationSchema)}
      </script>
    </Helmet>
  );
}
