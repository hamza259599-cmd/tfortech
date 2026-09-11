import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Optimize an image URL via Cloudinary Fetch (on-the-fly resize/compress, no backend changes needed)
export function optimizeImg(url, width = 500) {
    if (!url) return url;
    if (url.includes('res.cloudinary.com')) return url;
    return `https://res.cloudinary.com/dl8o87udw/image/fetch/f_auto,q_auto,w_${width}/${encodeURIComponent(url)}`;
}
