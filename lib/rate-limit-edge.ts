import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Minimal in-memory fallback for edge runtime
class InMemoryRateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map()

  async limit(identifier: string, limit: number, window: number) {
    const now = Date.now()
    const existing = this.attempts.get(identifier)

    if (existing && existing.resetAt > now) {
      if (existing.count >= limit) {
        return { success: false, limit, remaining: 0, reset: existing.resetAt }
      }
      existing.count++
      return { success: true, limit, remaining: limit - existing.count, reset: existing.resetAt }
    }

    this.attempts.set(identifier, { count: 1, resetAt: now + window })
    return { success: true, limit, remaining: limit - 1, reset: now + window }
  }
}

let redis: Redis | null = null
let usingInMemory = false

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
    // console.log('✅ Edge rate limiting using Upstash Redis')
  } else {
    usingInMemory = true
  }
} catch {
  usingInMemory = true
}

const inMemoryLimiter = new InMemoryRateLimiter()

export function createRateLimiter(limit: number, window: string) {
  if (redis && !usingInMemory) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, parseWindowToDuration(window)),
      analytics: true,
      prefix: "@ratelimit",
    })
  }
  const windowMs = parseWindow(window)
  return {
    limit: async (identifier: string) => inMemoryLimiter.limit(identifier, limit, windowMs),
  }
}

function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/)
  if (!match) throw new Error(`Invalid window format: ${window}`)
  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * multipliers[unit as keyof typeof multipliers]
}

function parseWindowToDuration(window: string): `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}` {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/)
  if (!match) throw new Error(`Invalid window format: ${window}`)
  const value = match[1]
  const unit = match[2] as 's' | 'm' | 'h' | 'd'
  return `${value} ${unit}` as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
}

export const authRateLimit = createRateLimiter(100, "5 m") // Very lenient for auth - allows testing
export const paymentRateLimit = createRateLimiter(3, "1 h")
export const apiRateLimit = createRateLimiter(100, "1 m")
export const adminRateLimit = createRateLimiter(50, "1 m")
export const webhookRateLimit = createRateLimiter(30, "1 m")
export const emailRateLimit = createRateLimiter(10, "1 h")

export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1'
  return `ip:${ip}`
}

export async function checkRateLimit(
  ratelimit: ReturnType<typeof createRateLimiter>,
  identifier: string
): Promise<{ limited: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await ratelimit.limit(identifier)
  return { limited: !success, remaining: remaining || 0, reset: reset || Date.now() + 60000 }
}
