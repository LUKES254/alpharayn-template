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

    const { data, error } = await supabaseAdmin
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch campaign')
    }
    if (!data) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Campaign not found')
    }

    return NextResponse.json({ campaign: data, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/campaigns/[id]', method: 'GET' })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await adminLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_campaigns')
      .delete()
      .eq('id', params.id)
      .eq('status', 'draft')
      .select('id')
      .maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to delete campaign')
    }
    if (!data) {
      throw new APIError(400, ErrorCodes.CONFLICT, 'Only draft campaigns can be deleted')
    }

    return NextResponse.json({ success: true, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/campaigns/[id]', method: 'DELETE' })
  }
}
