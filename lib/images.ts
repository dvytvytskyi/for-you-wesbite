/**
 * Optimized Image Utility
 * Only adds transformations to images already on Cloudinary.
 * Reverts external images to direct URLs to avoid 401 errors.
 */

export function getOptimizedImageUrl(url: string, width: number = 800): string {
    if (!url) return '';

    // Only optimize if it's already a Cloudinary URL
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        const parts = url.split('/upload/');
        // Insert optimization parameters after /upload/
        return `${parts[0]}/upload/f_auto,q_auto:good,w_${width}/${parts[1]}`;
    }

    // For Hetzner, Reelly, and other direct URLs, return as is
    // Next.js Image component will handle optimization via its own proxy
    return url;
}
