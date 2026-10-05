import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NewsletterSubscribeSchema } from '@/lib/validation/newsletter-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { createRateLimiter, getRateLimitIdentifier } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'

const subscribeLimiter = createRateLimiter(5, '15 m')

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  try {
    const identifier = getRateLimitIdentifier(request)
    const rate = await subscribeLimiter.limit(identifier)
    if (!rate.success) {
      throw new APIError(429, ErrorCodes.RATE_LIMIT_EXCEEDED, 'Too many subscribe attempts')
    }

    const body = await request.json()
    const parsed = NewsletterSubscribeSchema.safeParse(body)
    if (!parsed.success) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid input', parsed.error.errors)
    }

    const { email, source = 'website', preferences, metadata } = parsed.data

    // Check existing subscriber
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, status, confirmed_at')
      .eq('email', email)
      .maybeSingle()

    if (existing && existing.status === 'active') {
      throw new APIError(409, ErrorCodes.ALREADY_EXISTS, 'Already subscribed')
    }

    const confirmationToken = crypto.randomBytes(24).toString('hex')
    const now = new Date().toISOString()

    if (existing) {
      const { error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          unsubscribed_at: null,
          confirmation_token: confirmationToken,
          confirmed_at: null,
          source,
          preferences: preferences || null,
          metadata: metadata || null,
          subscribed_at: now,
        })
        .eq('id', existing.id)

      if (error) {
        throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to update subscriber')
      }
    } else {
      const { error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({
          email,
          status: 'active',
          source,
          confirmation_token: confirmationToken,
          preferences: preferences || undefined,
          metadata: metadata || undefined,
        })

      if (error) {
        throw new APIError(500, ErrorCodes.DATABASE_ERROR, 'Failed to create subscriber')
      }
    }

    // Send confirmation email (double opt-in)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const confirmUrl = `${appUrl}/newsletter/confirm?token=${confirmationToken}`
    
    try {
      await sendEmail({
        to: email,
        subject: 'Confirm your subscription',
        html: `<p>Confirm your subscription to our newsletter.</p><p><a href="${confirmUrl}">Confirm subscription</a></p>`,
      })
    } catch (emailError) {
      // In development, email sending may fail due to Resend restrictions
      // Log the error but allow subscription to proceed
      console.warn('[Newsletter] Email sending failed:', emailError instanceof Error ? emailError.message : 'Unknown error')
      
      // Only fail in production
      if (process.env.NODE_ENV === 'production') {
        throw emailError
      }
    }

    return NextResponse.json({ success: true, message: 'Check your email to confirm', correlationId }, { status: 201 })
  } catch (error) {
    return handleAPIError(error, correlationId, { route: '/api/newsletter/subscribe', method: 'POST' })
  }
}
