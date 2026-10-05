import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const confirmLimiter = createRateLimiter(10, '1 h')

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const identifier = getRateLimitIdentifier(request)
    const rate = await confirmLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many confirmation attempts')
    }

    const body = await request.json()
    const token = body?.token as string | undefined
    if (!token) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Token is required')
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({ confirmed_at: new Date().toISOString(), status: 'active' })
      .eq('confirmation_token', token)
      .select('id')
      .maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to confirm')
    }
    if (!data) {
      throw new APIError(400, ErrorCodes.INVALID_INPUT, 'Invalid or expired token')
    }

    return NextResponse.json({ success: true, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/newsletter/confirm', method: 'POST' })
  }
}
