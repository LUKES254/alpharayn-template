import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const adminLimiter = createRateLimiter(50, '1 m')

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await adminLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (userError) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch entry')
    }
    if (!user) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Entry not found')
    }

    const { data: referrals, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('id, email, full_name, referral_count, referred_by, position')
      .eq('referred_by', params.id)

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch referrals')
    }

    return NextResponse.json({ user, referred_users: referrals || [], correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/waitlist/referrals/[id]', method: 'GET' })
  }
}
