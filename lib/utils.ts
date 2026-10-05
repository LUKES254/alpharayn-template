import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: string) {
  // Use provided currency, or fallback to env var, or fallback to 'NGN'
  const targetCurrency = (currency || process.env.NEXT_PUBLIC_CURRENCY || 'NGN').toUpperCase()

  let locale = 'en-NG'

  // Map common currencies to appropriate locales for correct symbol display
  switch (targetCurrency) {
    case 'KES':
      locale = 'en-KE'
      break
    case 'USD':
      locale = 'en-US'
      break
    case 'EUR':
      locale = 'en-IE' // English (Ireland) uses €
      break
    case 'GBP':
      locale = 'en-GB'
      break
    case 'NGN':
    default:
      locale = 'en-NG'
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: targetCurrency,
  }).format(amount)
}

export function formatDate(date: string | Date) {

  return new Intl.DateTimeFormat('en-NG', {

    year: 'numeric',

    month: 'long',

    day: 'numeric',

  }).format(new Date(date))

}



// Helper to check if URL is a valid image URL

export function isValidImageUrl(url: string | null | undefined): boolean {

  if (!url) return false

  try {

    const parsedUrl = new URL(url)

    // Check if it looks like an image URL (has image extension or common image CDN patterns)

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']

    const hasImageExtension = imageExtensions.some(ext => parsedUrl.pathname.toLowerCase().includes(ext))

    const isImageCDN = ['unsplash.com', 'images.unsplash.com', 'cloudinary.com', 'imgur.com', 'i.imgur.com', 'pexels.com', 'images.pexels.com'].some(cdn => parsedUrl.hostname.includes(cdn))

    // Also accept URLs with image in path or query

    const hasImagePath = parsedUrl.pathname.includes('/image') || parsedUrl.search.includes('image')

    return hasImageExtension || isImageCDN || hasImagePath

  } catch {

    return false

  }

}
