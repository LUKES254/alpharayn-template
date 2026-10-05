import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'

const adminLimiter = createRateLimiter(50, '1 m')

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await adminLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const source = searchParams.get('source') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (source) query = query.eq('source', source)
    if (search) query = query.ilike('email', `%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch subscribers')
    }

    return NextResponse.json({ subscribers: data || [], total: count || 0, page, limit, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/subscribers', method: 'GET' })
  }
}
