/**
 * Image optimization utility for responsive loading
 * 
 * This utility helps optimize images for different screen sizes and devices
 * by providing responsive image loading and lazy loading capabilities.
 */

/**
 * Get the appropriate image URL based on screen width
 * @param {string} originalUrl - The original image URL
 * @param {number} screenWidth - Current screen width
 * @returns {string} - Optimized image URL
 */
export const getResponsiveImageUrl = (originalUrl, screenWidth) => {
  // If the URL is already a responsive URL or doesn't exist, return as is
  if (!originalUrl || originalUrl.includes('w=')) {
    return originalUrl;
  }

  // Determine size suffix based on screen width
  let sizeSuffix = '';
  
  if (screenWidth <= 480) {
    sizeSuffix = 'small';
  } else if (screenWidth <= 768) {
    sizeSuffix = 'medium';
  } else {
    sizeSuffix = 'large';
  }

  // Check if the URL contains a query string
  const hasQueryString = originalUrl.includes('?');
  
  // Add size parameter
  return `${originalUrl}${hasQueryString ? '&' : '?'}size=${sizeSuffix}`;
};

/**
 * Creates a responsive image component with lazy loading
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {Object} props - Additional props for the img element
 * @returns {Object} - Image element props with optimization
 */
export const getOptimizedImageProps = (src, alt, props = {}) => {
  return {
    src,
    alt,
    loading: 'lazy', // Enable lazy loading
    ...props,
    onError: (e) => {
      // Fallback to placeholder on error
      e.target.src = '/placeholder.png';
      if (props.onError) props.onError(e);
    }
  };
};

/**
 * Preloads critical images for faster rendering
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export const preloadCriticalImages = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return;
  
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};