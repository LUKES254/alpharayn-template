import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { 
  apiRateLimit, 
  adminRateLimit, 
  authRateLimit,
  webhookRateLimit,
  getRateLimitIdentifier,
  createRateLimiter
} from "./lib/rate-limit-edge"
import { extractCSRFToken } from "./lib/csrf-edge"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = getRateLimitIdentifier(request)
    let ratelimit = apiRateLimit

    // Custom rate limits for newsletter/waitlist/public endpoints
    const newsletterSubscribeLimit = createRateLimiter(5, "15 m")
    const newsletterUnsubscribeLimit = createRateLimiter(10, "1 h")
    const newsletterConfirmLimit = createRateLimiter(10, "1 h")
    const waitlistJoinLimit = createRateLimiter(5, "15 m")
    const waitlistPositionLimit = createRateLimiter(20, "1 m")
    const magicLinkLimit = createRateLimiter(3, "15 m") // 3 requests per 15 minutes for magic link
    
    // Apply stricter rate limiting to specific endpoints
    if (pathname.startsWith('/api/admin')) {
      ratelimit = adminRateLimit
    } else if (pathname === '/api/auth/sign-in/magic-link') {
      ratelimit = magicLinkLimit
    } else if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/user/password')) {
      ratelimit = authRateLimit
    } else if (pathname.startsWith('/api/payments/webhook')) {
      ratelimit = webhookRateLimit
    } else if (pathname.startsWith('/api/newsletter/subscribe')) {
      ratelimit = newsletterSubscribeLimit
    } else if (pathname.startsWith('/api/newsletter/unsubscribe')) {
      ratelimit = newsletterUnsubscribeLimit
    } else if (pathname.startsWith('/api/newsletter/confirm')) {
      ratelimit = newsletterConfirmLimit
    } else if (pathname.startsWith('/api/waitlist/join')) {
      ratelimit = waitlistJoinLimit
    } else if (pathname.startsWith('/api/waitlist/position')) {
      ratelimit = waitlistPositionLimit
    } else if (pathname.startsWith('/api/admin/newsletter')) {
      ratelimit = adminRateLimit
    } else if (pathname.startsWith('/api/admin/waitlist')) {
      ratelimit = adminRateLimit
    } else if (pathname.match(/^\/api\/blog\/[^/]+\/view/)) {
      // Stricter rate limit for view tracking (10 req/min per post)
      ratelimit = createRateLimiter(10, "1 m")
    } else if (pathname.startsWith('/api/blog/search')) {
      // Moderate rate limit for search (50 req/min)
      ratelimit = createRateLimiter(50, "1 m")
    } else if (pathname.startsWith('/api/blog')) {
      // Standard rate limit for blog listing (100 req/min)
      ratelimit = apiRateLimit
    }
    
    const { success, remaining, reset } = await ratelimit.limit(ip)
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    // CSRF protection for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      // Skip CSRF for webhook endpoints (they use signature verification)
      if (pathname.startsWith('/api/payments/webhook')) {
        const response = NextResponse.next()
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
        return response
      }
      
      // Skip CSRF for auth endpoints (BetterAuth handles this)
      if (pathname.startsWith('/api/auth/')) {
        const response = NextResponse.next()
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
        return response
      }
      
      // For other state-changing requests, check CSRF token presence
      // Actual validation happens in the API route with session context
      const csrfToken = extractCSRFToken(request)
      
      if (!csrfToken) {
        return new NextResponse(
          JSON.stringify({
            error: 'CSRF token required for this operation',
            code: 'CSRF_TOKEN_MISSING',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }
    
    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
    return response
  }
  
  // Protected routes (dashboard, admin, profile)
  const protectedRoutes = ["/dashboard", "/admin", "/profile"]
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // BetterAuth will handle authentication
    // This middleware can be extended for role-based routing
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}