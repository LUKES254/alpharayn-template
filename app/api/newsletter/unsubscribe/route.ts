import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const unsubscribeLimiter = createRateLimiter(10, '1 h')

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const identifier = getRateLimitIdentifier(request)
    const rate = await unsubscribeLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many unsubscribe attempts')
    }

    const body = await request.json()
    const token = body?.token as string | undefined
    const email = body?.email as string | undefined

    if (!token && !email) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Token or email required')
    }

    const query = supabaseAdmin.from('newsletter_subscribers')
    let update
    if (token) {
      update = query.update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('confirmation_token', token)
    } else {
      update = query.update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() }).eq('email', email!)
    }

    const { data, error } = await update.select('id').maybeSingle()
    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to unsubscribe')
    }
    if (!data) {
      throw new APIError(400, ErrorCodes.NOT_FOUND, 'Invalid unsubscribe request')
    }

    return NextResponse.json({ success: true, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/newsletter/unsubscribe', method: 'POST' })
  }
}
