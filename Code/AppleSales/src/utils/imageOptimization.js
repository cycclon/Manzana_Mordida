/**
 * Image Optimization Utilities for Cloudflare R2 + Workers
 *
 * Cloudflare Image Resizing via Workers allows on-the-fly image transformations
 * Format: https://your-worker.workers.dev/cdn-cgi/image/[options]/[image-url]
 */

/**
 * Get optimized image URL for thumbnails (device cards)
 * - Resized to 400px width
 * - Quality 80 for good balance
 * - Format webp for better compression
 *
 * @param {string} imageUrl - Original R2 image URL
 * @returns {string} Optimized image URL
 */
export const getThumbnailUrl = (imageUrl) => {
  if (!imageUrl) return '/placeholder-device.png';

  // If it's already a placeholder or external URL, return as-is
  if (imageUrl.startsWith('/') || !imageUrl.includes('r2.dev')) {
    return imageUrl;
  }

  // Apply Cloudflare Image Resizing transformations
  // width=400: Resize to 400px width (maintains aspect ratio)
  // quality=80: Good quality with compression
  // format=webp: Modern format with better compression
  // fit=cover: Crop to fit dimensions
  const options = 'width=400,quality=80,format=webp,fit=cover';

  // Insert transformation options before the image path
  // Example: https://pub-xxx.r2.dev/image.jpg
  // Becomes: https://pub-xxx.r2.dev/cdn-cgi/image/width=400,quality=80,format=webp,fit=cover/image.jpg
  const url = new URL(imageUrl);
  return `${url.origin}/cdn-cgi/image/${options}${url.pathname}`;
};

/**
 * Get full quality image URL (device detail page, carousel)
 * - No resize, original dimensions
 * - Quality 90 for high quality
 * - Format auto (lets browser choose best format)
 *
 * @param {string} imageUrl - Original R2 image URL
 * @returns {string} High quality image URL
 */
export const getFullQualityUrl = (imageUrl) => {
  if (!imageUrl) return '/placeholder-device.png';

  // If it's already a placeholder or external URL, return as-is
  if (imageUrl.startsWith('/') || !imageUrl.includes('r2.dev')) {
    return imageUrl;
  }

  // Apply minimal transformations for full quality
  // quality=90: High quality
  // format=auto: Let browser choose (webp for modern, jpeg for legacy)
  const options = 'quality=90,format=auto';

  const url = new URL(imageUrl);
  return `${url.origin}/cdn-cgi/image/${options}${url.pathname}`;
};

/**
 * Get medium quality image URL (for other uses)
 * - Resized to 800px width
 * - Quality 85
 * - Format webp
 *
 * @param {string} imageUrl - Original R2 image URL
 * @returns {string} Medium quality image URL
 */
export const getMediumQualityUrl = (imageUrl) => {
  if (!imageUrl) return '/placeholder-device.png';

  if (imageUrl.startsWith('/') || !imageUrl.includes('r2.dev')) {
    return imageUrl;
  }

  const options = 'width=800,quality=85,format=webp,fit=scale-down';

  const url = new URL(imageUrl);
  return `${url.origin}/cdn-cgi/image/${options}${url.pathname}`;
};
