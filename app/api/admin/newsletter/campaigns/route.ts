import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { CampaignCreateSchema } from '@/lib/validation/newsletter-schema'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'

const adminLimiter = createRateLimiter(10, '1 h')

async function sendCampaignToSubscribers(campaignId: string, subject: string, content: string, preview?: string) {
  const { data: subscribers, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email')
    .eq('status', 'active')
    .not('confirmed_at', 'is', null)

  if (error) {
    throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch recipients')
  }

  let sent = 0
  for (const sub of subscribers || []) {
    await sendEmail({
      to: sub.email,
      subject,
      html: content,
      text: preview,
    })
    sent += 1
  }

  await supabaseAdmin
    .from('newsletter_campaigns')
    .update({ status: 'sent', sent_count: sent, sent_at: new Date().toISOString() })
    .eq('id', campaignId)
}

export async function GET(request: NextRequest) {
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
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to fetch campaigns')
    }

    return NextResponse.json({ campaigns: data || [], total: data?.length || 0, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/campaigns', method: 'GET' })
  }
}

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    await requireRole('admin')
    const identifier = getRateLimitIdentifier(request)
    const rate = await adminLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many send attempts')
    }

    const body = await request.json()
    const parsed = CampaignCreateSchema.safeParse(body)
    if (!parsed.success) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid input', parsed.error.errors)
    }

    const { title, subject, preview_text, content, scheduled_at } = parsed.data

    const { data, error } = await supabaseAdmin
      .from('newsletter_campaigns')
      .insert({ title, subject, preview_text, content, status: scheduled_at ? 'scheduled' : 'sending' })
      .select('id, status')
      .single()

    if (error || !data) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to create campaign')
    }

    if (!scheduled_at) {
      await sendCampaignToSubscribers(data.id, subject, content, preview_text)
    } else {
      await supabaseAdmin
        .from('newsletter_campaigns')
        .update({ status: 'scheduled', scheduled_at })
        .eq('id', data.id)
    }

    return NextResponse.json({ success: true, id: data.id, correlationId })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/admin/newsletter/campaigns', method: 'POST' })
  }
}
