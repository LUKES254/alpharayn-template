import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { v4 as uuidv4 } from 'uuid'
import { FALLBACK_PLANS, getPlanAmountMinorUnits, fetchPaystackPlans } from '../../../../lib/plans'
import { InitializePaymentSchema } from "@/lib/validation/payment-schema"
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from "@/lib/error-handler"
import { paymentRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const session = await getSession()

    if (!session?.user) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Unauthorized')
    }
    
    // Rate limit payment attempts per user
    const identifier = getRateLimitIdentifier(request, session.user.id)
    const { limited } = await paymentRateLimit.limit(identifier)
    
    if (limited) {
      throw new APIError(
        429, 
        ErrorCodes.TOO_MANY_ATTEMPTS, 
        'Too many payment attempts. Please try again later.'
      )
    }
    
    const body = await request.json()
    
    // Validate input using Zod schema
    const validated = InitializePaymentSchema.safeParse(body)
    
    if (!validated.success) {
      const details = validated.error?.errors?.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })) ?? []

      return NextResponse.json(
        {
          error: "Validation failed",
          code: ErrorCodes.VALIDATION_ERROR,
          details,
          correlationId,
        },
        { status: 400 }
      )
    }
    
    const { amount, tier, currency, planId } = validated.data

    // Fetch dynamic plans from Paystack for validation
    const paystackPlans = await fetchPaystackPlans()

    // Verify amount matches tier pricing (prevent tampering)
    // Check against both Paystack plans and fallback plans
    if (!FALLBACK_PLANS[tier]) {
      throw new APIError(400, ErrorCodes.INVALID_INPUT, 'Invalid subscription tier')
    }
    
    const expectedAmount = getPlanAmountMinorUnits(tier, currency, paystackPlans)
    if (expectedAmount === null) {
      throw new APIError(
        400, 
        ErrorCodes.INVALID_PAYMENT, 
        `No pricing found for tier ${tier} in currency ${currency}`
      )
    }
    
    if (amount !== expectedAmount) {
      throw new APIError(
        400, 
        ErrorCodes.INVALID_PAYMENT, 
        `Amount mismatch: expected ${expectedAmount} ${currency}, received ${amount}`
      )
    }
    
    // Generate unique reference
    const reference = `ref_${uuidv4()}`
    
    // Create pending payment record using service role to bypass RLS
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: session.user.id,
        paystack_reference: reference,
        amount: amount / 100, // Convert from minor units to major (kobo to naira, cents to shilling)
        currency,
        status: 'pending',
        plan_id: null, // We store tier in metadata instead of linking to plans table
        metadata: {
          initiated_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          ip_address: request.ip || 'unknown',
          tier
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      throw new APIError(
        500,
        ErrorCodes.DATABASE_ERROR,
        'Failed to create payment record'
      )
    }

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        amount,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`,
        metadata: {
          userId: session.user.id,
          tier,
          paymentId: payment.id
        }
      })
    })

    const data = await response.json()

    if (!data.status) {
      // Update payment status to failed
      await supabaseAdmin
        .from('payments')
        .update({ 
          status: 'failed',
          paystack_response: data
        })
        .eq('id', payment.id)

      throw new APIError(
        402,
        ErrorCodes.PAYMENT_GATEWAY_ERROR,
        data.message || 'Failed to initialize payment with payment provider'
      )
    }

    // Update payment with Paystack reference
    await supabaseAdmin
      .from('payments')
      .update({ 
        paystack_response: data,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'payment_initialized',
      resource_type: 'payment',
      resource_id: payment.id,
      changes: { status: 'pending', amount: amount / 100 }
    })

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
      access_code: data.data.access_code,
      correlationId,
    })

  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/payments/initialize',
      method: 'POST'
    })
  }
}