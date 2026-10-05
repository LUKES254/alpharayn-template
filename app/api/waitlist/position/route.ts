import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const positionLimiter = createRateLimiter(20, '1 m')

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const identifier = getRateLimitIdentifier(request)
    const rate = await positionLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const code = searchParams.get('code')

    if (!email && !code) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'email or code required')
    }

    const query = supabaseAdmin
      .from('waitlist_entries')
      .select('position, referral_count, status')

    const { data, error } = email
      ? await query.eq('email', email).maybeSingle()
      : await query.eq('referral_code', code!).maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to get position')
    }
    if (!data) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Not found')
    }

    return NextResponse.json({ ...data, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/waitlist/position', method: 'GET' })
  }
}
