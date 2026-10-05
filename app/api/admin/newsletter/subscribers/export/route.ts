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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    let query = supabaseAdmin.from('newsletter_subscribers').select('email, status, source, subscribed_at')
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to export subscribers')
    }

    const rows = data || []
    const csv = ['email,status,source,subscribed_at', ...rows.map((r) => `${r.email},${r.status},${r.source || ''},${r.subscribed_at || ''}`)].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
        'Cache-Control': 'no-store',
        'X-Correlation-Id': correlationId,
      },
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/subscribers/export', method: 'GET' })
  }
}
