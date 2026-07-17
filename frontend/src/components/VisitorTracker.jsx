import { useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

/**
 * Detects device type based on screen width and user agent
 */
const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  if (/ipad|tablet|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (width < 768) {
    return 'mobile';
  }
  if (width < 1024) {
    return 'tablet';
  }
  
  return 'desktop';
};

/**
 * Gets browser name from user agent
 */
const getBrowser = () => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Other';
};

/**
 * Generates or retrieves unique visitor ID
 */
const getVisitorId = () => {
  let visitorId = localStorage.getItem('gojuniors_visitor_id');
  
  if (!visitorId) {
    visitorId = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gojuniors_visitor_id', visitorId);
  }
  
  return visitorId;
};

/**
 * Get UTM parameters from URL
 * Example URL: https://gojuniors.com/?utm_source=google&utm_campaign=summer_sale
 */
const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  
  const utmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    // Also check for Google Ads gclid parameter
    gclid: params.get('gclid'),
    // Facebook fbclid
    fbclid: params.get('fbclid')
  };
  
  // If gclid exists but no utm_source, it's from Google Ads
  if (utmParams.gclid && !utmParams.utm_source) {
    utmParams.utm_source = 'google';
    utmParams.utm_medium = 'cpc';
    utmParams.utm_campaign = utmParams.utm_campaign || 'google_ads';
  }
  
  // If fbclid exists but no utm_source, it's from Facebook
  if (utmParams.fbclid && !utmParams.utm_source) {
    utmParams.utm_source = 'facebook';
    utmParams.utm_medium = 'social';
    utmParams.utm_campaign = utmParams.utm_campaign || 'facebook_ads';
  }
  
  // Store UTM data in session for later use (product views, conversions)
  if (utmParams.utm_source || utmParams.utm_campaign) {
    sessionStorage.setItem('gojuniors_utm', JSON.stringify(utmParams));
  }
  
  return utmParams;
};

/**
 * Get stored UTM params from session
 */
export const getStoredUTMParams = () => {
  const stored = sessionStorage.getItem('gojuniors_utm');
  return stored ? JSON.parse(stored) : null;
};

/**
 * Track product view - call this from product detail page
 */
export const trackProductView = async (productId, productName) => {
  try {
    const visitorId = getVisitorId();
    await axios.post(`${API}/track-product-view`, null, {
      params: {
        visitor_id: visitorId,
        product_id: productId,
        product_name: productName
      }
    });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Track conversion (cart add or purchase)
 */
export const trackConversion = async (conversionType, productId = null, orderTotal = null) => {
  try {
    const visitorId = getVisitorId();
    await axios.post(`${API}/track-conversion`, null, {
      params: {
        visitor_id: visitorId,
        conversion_type: conversionType,
        product_id: productId,
        order_total: orderTotal
      }
    });
  } catch (error) {
    // Silently fail
  }
};

/**
 * VisitorTracker Component - tracks visitors and ad campaigns
 */
export default function VisitorTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        const deviceType = getDeviceType();
        const browser = getBrowser();
        const page = window.location.pathname;
        const utmParams = getUTMParams();
        
        await axios.post(`${API}/track-visit`, {
          visitor_id: visitorId,
          device_type: deviceType,
          browser: browser,
          page: page,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content
        });
        
        // Log for debugging (remove in production)
        if (utmParams.utm_source) {
          console.log('📊 Ad visitor tracked:', utmParams);
        }
      } catch (error) {
        // Silently fail
      }
    };
    
    // Track after small delay
    const timer = setTimeout(trackVisit, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null;
}
