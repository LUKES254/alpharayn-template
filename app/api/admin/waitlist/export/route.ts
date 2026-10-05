import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const exportLimiter = createRateLimiter(5, '1 h')

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await exportLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many exports')
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('email, full_name, referral_code, referral_count, position, status, joined_at')

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to export waitlist')
    }

    const rows = data || []
    const csv = ['email,full_name,referral_code,referral_count,position,status,joined_at', ...rows.map((r) => `${r.email},${r.full_name},${r.referral_code},${r.referral_count},${r.position},${r.status},${r.joined_at || ''}`)].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="waitlist.csv"',
        'Cache-Control': 'no-store',
        'X-Correlation-Id': correlationId,
      },
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/waitlist/export', method: 'GET' })
  }
}
