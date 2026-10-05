import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { generateCSRFToken } from '@/lib/csrf'
import { handleAPIError, generateCorrelationId } from '@/lib/error-handler'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/csrf-token
 * Returns CSRF token for the current session (client-side use)
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated', token: null },
        { status: 401 }
      )
    }

    // Get session token - try multiple sources
    let sessionToken: string | undefined = (session as any)?.token || (session as any)?.session?.token

    // If token not in session object, try cookies
    if (!sessionToken) {
      const cookieStore = await cookies()
      
      // Debug: log all cookies to find the correct name
      const allCookies = cookieStore.getAll()
      console.log('[CSRF Debug] All cookies:', allCookies.map(c => ({ name: c.name, valueLength: c.value?.length })))
      
      // Better Auth uses "better-auth.session_token" format
      // Also check for secure prefix version
      const sessionCookie = cookieStore.get('better-auth.session_token') || 
                            cookieStore.get('__Secure-better-auth.session_token')
      
      console.log('[CSRF Debug] Found session cookie:', sessionCookie?.name, 'value length:', sessionCookie?.value?.length)
      sessionToken = sessionCookie?.value
    }
    
    console.log('[CSRF Debug] Session token source:', sessionToken ? 'found' : 'not found', 'length:', sessionToken?.length)

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token not found', token: null },
        { status: 401 }
      )
    }

    const csrfToken = generateCSRFToken(sessionToken)

    return NextResponse.json({
      token: csrfToken,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/csrf-token',
      method: 'GET',
    })
  }
}
