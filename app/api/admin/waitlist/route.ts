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
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('waitlist_entries')
      .select('*', { count: 'exact' })
      .order('position', { ascending: true })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('email', `%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch waitlist')
    }

    const total = count || 0
    const pending = data?.filter((d) => d.status === 'pending').length || 0
    const approved = data?.filter((d) => d.status === 'approved').length || 0
    const invited = data?.filter((d) => d.status === 'invited').length || 0
    const converted = data?.filter((d) => d.status === 'converted').length || 0
    const conversion_rate = total ? Math.round((converted / total) * 100) : 0

    return NextResponse.json({
      entries: data || [],
      total,
      page,
      limit,
      stats: { total, pending, approved, invited, converted, conversion_rate },
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/waitlist', method: 'GET' })
  }
}
