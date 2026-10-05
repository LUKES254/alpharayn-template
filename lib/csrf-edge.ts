// Edge-safe CSRF helpers (no Node.js crypto)

/**
 * Extract CSRF token from request headers
 * @param request The incoming request
 * @returns The CSRF token or null
 */
export function extractCSRFToken(request: Request): string | null {
  return (
    request.headers.get("x-csrf-token") ||
    request.headers.get("X-CSRF-Token") ||
    null
  )
}

/**
 * Set CSRF token in response headers
 * @param token The CSRF token to set
 * @returns Headers object with CSRF token
 */
export function setCSRFTokenHeader(token: string): HeadersInit {
  return {
    "X-CSRF-Token": token,
  }
}
