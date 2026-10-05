/**
 * Centralized configuration file
 * All environment variables and defaults are managed here
 * 
 * SECURITY NOTES:
 * - Only use NEXT_PUBLIC_ prefix for values that MUST be exposed to client
 * - Never hardcode API keys, secrets, or sensitive data
 * - Use this file to provide safe defaults and validation
 */

// App Configuration
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Platform',
} as const

// Currency Configuration
export const DEFAULT_CURRENCY = (process.env.NEXT_PUBLIC_CURRENCY || 'KES') as 'NGN' | 'KES' | 'USD'

// Helper function to get API URLs consistently
export function getApiUrl(path: string): string {
  const base = APP_CONFIG.url
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

// Helper function to validate environment variables (server-side only)
export function validateServerEnv() {
  const required = [
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_PAYMENT_PAGE_SLUG',
    'SUPABASE_SERVICE_ROLE_KEY',
    'BETTER_AUTH_SECRET',
    'CSRF_SECRET',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`
    )
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️ Missing environment variables (development): ${missing.join(', ')}`
    )
  }
}

// OAuth Configuration (client-safe)
export const OAUTH_CONFIG = {
  googleEnabled: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
} as const
