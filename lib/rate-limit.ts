import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// In-memory fallback for development or when Redis is not configured
class InMemoryRateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map()

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now()
    const key = identifier
    const existing = this.attempts.get(key)

    if (existing && existing.resetAt > now) {
      if (existing.count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: existing.resetAt,
        }
      }
      existing.count++
      return {
        success: true,
        limit,
        remaining: limit - existing.count,
        reset: existing.resetAt,
      }
    }

    // New window
    this.attempts.set(key, { count: 1, resetAt: now + window })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window,
    }
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, value] of Array.from(this.attempts.entries())) {
      if (value.resetAt <= now) {
        this.attempts.delete(key)
      }
    }
  }
}

// Initialize Redis or fallback to in-memory
let redis: Redis | null = null
let usingInMemory = false

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
    console.log('✅ Rate limiting using Upstash Redis')
  } else {
    console.warn('⚠️ UPSTASH_REDIS_REST_URL not configured, using in-memory rate limiting (not suitable for production)')
    usingInMemory = true
  }
} catch (error) {
  console.error('❌ Failed to initialize Redis, falling back to in-memory rate limiting:', error)
  usingInMemory = true
}

// In-memory fallback instance
const inMemoryLimiter = new InMemoryRateLimiter()

// Cleanup in-memory cache every 5 minutes
if (usingInMemory) {
  setInterval(() => inMemoryLimiter.cleanup(), 5 * 60 * 1000)
}

// Helper to create rate limiter or use in-memory fallback
export function createRateLimiter(limit: number, window: string) {
  if (redis && !usingInMemory) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, parseWindowToDuration(window)),
      analytics: true,
      prefix: '@ratelimit',
    })
  }
  
  // Return in-memory fallback
  const windowMs = parseWindow(window)
  return {
    limit: async (identifier: string) => {
      return inMemoryLimiter.limit(identifier, limit, windowMs)
    }
  }
}

// Parse window string to milliseconds
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/)
  if (!match) throw new Error(`Invalid window format: ${window}`)
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * multipliers[unit as keyof typeof multipliers]
}

// Parse window string to Duration format for Upstash
function parseWindowToDuration(window: string): `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/)
  if (!match) throw new Error(`Invalid window format: ${window}`)
  
  const value = match[1]
  const unit = match[2] as 's' | 'm' | 'h' | 'd'
  
  // Convert to Upstash Duration format (needs space between value and unit)
  return `${value} ${unit}` as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
}

// Authentication rate limiting (login, signup, password reset)
// 5 attempts per 15 minutes per IP
export const authRateLimit = createRateLimiter(5, "15 m")

// Payment initialization rate limiting
// 3 payment attempts per hour per user
export const paymentRateLimit = createRateLimiter(3, "1 h")

// General API rate limiting
// 100 requests per minute per IP
export const apiRateLimit = createRateLimiter(100, "1 m")

// Admin endpoint rate limiting
// 50 requests per minute per IP (stricter than general API)
export const adminRateLimit = createRateLimiter(50, "1 m")

// Webhook rate limiting (external services)
// 30 requests per minute per IP
export const webhookRateLimit = createRateLimiter(30, "1 m")

// Email sending rate limiting
// 10 emails per hour per user
export const emailRateLimit = createRateLimiter(10, "1 h")

// Helper function to get identifier (IP or user ID)
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  // Use user ID if authenticated, otherwise fall back to IP
  if (userId) {
    return `user:${userId}`
  }
  
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1'
  
  return `ip:${ip}`
}

// Helper to check rate limit and return response if exceeded
export async function checkRateLimit(
  ratelimit: ReturnType<typeof createRateLimiter>,
  identifier: string
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await ratelimit.limit(identifier)
  
  return {
    limited: !success,
    remaining: remaining || 0,
    reset: reset || Date.now() + 60000,
  }
}
