import crypto from 'crypto'

// CSRF token secret - MUST be set in production environment
if (!process.env.CSRF_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: CSRF_SECRET must be set in production environment')
  }
  console.warn('⚠️ CSRF_SECRET not set in environment variables, using randomly generated secret (sessions will be invalidated on restart)')
}

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex')

/**
 * Generate a CSRF token for a given session token
 * @param sessionToken The user's session token
 * @returns A CSRF token string
 */
export function generateCSRFToken(sessionToken: string): string {
  // Create an HMAC using the session token and CSRF secret
  const hmac = crypto.createHmac('sha256', CSRF_SECRET)
  hmac.update(sessionToken)
  return hmac.digest('hex')
}

/**
 * Validate a CSRF token against a session token
 * @param token The CSRF token to validate
 * @param sessionToken The user's session token
 * @returns True if valid, false otherwise
 */
export function validateCSRFToken(token: string | null, sessionToken: string): boolean {
  if (!token) {
    return false
  }

  try {
    const expectedToken = generateCSRFToken(sessionToken)
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    )
  } catch (error) {
    // Token length mismatch or other error
    return false
  }
}

/**
 * Generate a double-submit CSRF token (alternative approach)
 * This generates a random token that's stored in both cookie and form
 * @returns A random CSRF token
 */
export function generateDoubleSubmitToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Validate double-submit CSRF token
 * @param cookieToken Token from cookie
 * @param headerToken Token from request header/body
 * @returns True if tokens match, false otherwise
 */
export function validateDoubleSubmitToken(
  cookieToken: string | null,
  headerToken: string | null
): boolean {
  if (!cookieToken || !headerToken) {
    return false
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    )
  } catch (error) {
    return false
  }
}

/**
 * Extract CSRF token from request headers
 * @param request The incoming request
 * @returns The CSRF token or null
 */
export function extractCSRFToken(request: Request): string | null {
  return request.headers.get('x-csrf-token') || 
         request.headers.get('X-CSRF-Token') ||
         null
}

/**
 * Set CSRF token in response headers
 * @param token The CSRF token to set
 * @returns Headers object with CSRF token
 */
export function setCSRFTokenHeader(token: string): HeadersInit {
  return {
    'X-CSRF-Token': token,
  }
}
