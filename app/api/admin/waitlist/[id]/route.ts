import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'

const adminLimiter = createRateLimiter(30, '1 m')

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await adminLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many requests')
    }

    const body = await request.json()
    const { status, priority } = body as { status?: string; priority?: boolean }

    const updates: Record<string, unknown> = {}
    if (typeof priority === 'boolean') updates.priority = priority
    if (status) updates.status = status
    if (status === 'invited') updates.invited_at = new Date().toISOString()

    if (Object.keys(updates).length === 0) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'No updates provided')
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .update(updates)
      .eq('id', params.id)
      .select('email, referral_code, position')
      .maybeSingle()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to update waitlist entry')
    }
    if (!data) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Entry not found')
    }

    if (status === 'invited') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const inviteLink = `${appUrl}/auth/sign-up?code=${data.referral_code}`
      await sendEmail({
        to: data.email,
        subject: 'You are invited',
        html: `<p>Your invite is ready.</p><p><a href="${inviteLink}">Complete signup</a></p>`,
      })
    }

    return NextResponse.json({ success: true, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/waitlist/[id]', method: 'PATCH' })
  }
}
