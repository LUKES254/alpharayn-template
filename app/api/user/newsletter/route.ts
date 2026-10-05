import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NewsletterUpdatePreferencesSchema } from '@/lib/validation/newsletter-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const userLimiter = createRateLimiter(20, '1 m')

async function getSessionOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized')
  }
  return session
}

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const session = await getSessionOrThrow()
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const rate = await userLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('status, preferences, confirmed_at')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch preferences')
    }

    return NextResponse.json({
      subscribed: !!data && data.status === 'active',
      status: data?.status || 'unsubscribed',
      confirmed: Boolean(data?.confirmed_at),
      preferences: data?.preferences || null,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/user/newsletter', method: 'GET' })
  }
}

export async function PATCH(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const session = await getSessionOrThrow()
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const rate = await userLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const body = await request.json()
    const parsed = NewsletterUpdatePreferencesSchema.safeParse(body)
    if (!parsed.success) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid input', parsed.error.errors)
    }

    const { preferences } = parsed.data

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({
        email: session.user.email,
        user_id: session.user.id,
        status: 'active',
        preferences,
      }, { onConflict: 'email' })

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to update preferences')
    }

    return NextResponse.json({ success: true, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/user/newsletter', method: 'PATCH' })
  }
}
