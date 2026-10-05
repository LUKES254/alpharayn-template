import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { WaitlistJoinSchema } from '@/lib/validation/newsletter-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'

const joinLimiter = createRateLimiter(5, '15 m')

function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex')
}

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const identifier = getRateLimitIdentifier(request)
    const rate = await joinLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many waitlist attempts')
    }

    const body = await request.json()
    const parsed = WaitlistJoinSchema.safeParse(body)
    if (!parsed.success) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid input', parsed.error.issues)
    }

    const {
      email,
      full_name,
      company,
      role,
      use_case,
      company_size,
      referred_by_code,
      utm_source,
      utm_medium,
      utm_campaign,
      metadata,
    } = parsed.data

    // Check for duplicate
    const { data: existing } = await supabaseAdmin
      .from('waitlist_entries')
      .select('id, referral_code, position, referral_count')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      throw new APIError(409, ErrorCodes.ALREADY_EXISTS, 'Already on waitlist')
    }

    // Resolve referrer
    let referred_by: string | null = null
    if (referred_by_code) {
      const { data: referrer } = await supabaseAdmin
        .from('waitlist_entries')
        .select('id')
        .eq('referral_code', referred_by_code)
        .maybeSingle()
      if (referrer?.id) {
        referred_by = referrer.id
      }
    }

    const referral_code = generateReferralCode()
    const insertPayload = {
      email,
      full_name,
      company,
      role,
      use_case,
      company_size,
      referred_by,
      referral_code,
      utm_source,
      utm_medium,
      utm_campaign,
      metadata,
    }

    const { data: entry, error } = await supabaseAdmin
      .from('waitlist_entries')
      .insert(insertPayload)
      .select('id, position, referral_code, referral_count')
      .single()

    if (error) {
      throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to join waitlist')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const referralUrl = `${appUrl}/waitlist?ref=${entry.referral_code}`

    try {
      await sendEmail({
        to: email,
        subject: "You're on the waitlist",
        html: `<p>Thanks for joining the waitlist.</p><p>Your position: ${entry.position}</p><p>Share: <a href="${referralUrl}">${referralUrl}</a></p>`,
      })
    } catch (emailError) {
      console.warn('[Waitlist] Email sending failed:', emailError instanceof Error ? emailError.message : 'Unknown error')

      // Allow in development; enforce in production
      if (process.env.NODE_ENV === 'production') {
        throw emailError
      }
    }

    return NextResponse.json({
      success: true,
      position: entry.position,
      referral_code: entry.referral_code,
      referral_url: referralUrl,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/waitlist/join', method: 'POST' })
  }
}
