import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { v4 as uuidv4 } from 'uuid'
import { InitializeOneTimePaymentSchema } from '@/lib/validation/payment-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { paymentRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const session = await getSession()
    
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
    
    // Validate input
    const validated = InitializeOneTimePaymentSchema.safeParse(body)
    
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
          details: validated.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
          correlationId,
        },
        { status: 400 }
      )
    }
    
    const { amount, productId, currency } = validated.data

    // Fetch product to verify it exists and amount matches
    const { data: product, error: productError } = await supabaseAdmin
      .from('one_time_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      throw new APIError(
        404,
        ErrorCodes.NOT_FOUND,
        'Product not found or is inactive'
      )
    }

    // Verify amount matches product price
    if (amount !== product.amount) {
      throw new APIError(
        400,
        ErrorCodes.INVALID_PAYMENT,
        `Amount mismatch: expected ${product.amount}, received ${amount}`
      )
    }

    // Verify currency matches
    if (currency.toUpperCase() !== product.currency) {
      throw new APIError(
        400,
        ErrorCodes.INVALID_PAYMENT,
        `Currency mismatch: expected ${product.currency}, received ${currency}`
      )
    }

    // Generate unique reference
    const reference = `otp_${uuidv4()}`

    // Create pending purchase record
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('one_time_purchases')
      .insert({
        user_id: session.user.id,
        product_id: productId,
        paystack_reference: reference,
        amount,
        currency,
        status: 'pending',
        metadata: {
          initiated_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          ip_address: request.ip || 'unknown',
          product_name: product.name,
        }
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError)
      throw new APIError(
        500,
        ErrorCodes.DATABASE_ERROR,
        'Failed to create purchase record'
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
          purchaseId: purchase.id,
          productId,
          productName: product.name,
          type: 'one-time'
        }
      })
    })

    const data = await response.json()

    if (!data.status) {
      // Update purchase status to failed
      await supabaseAdmin
        .from('one_time_purchases')
        .update({ 
          status: 'failed',
          paystack_response: data
        })
        .eq('id', purchase.id)

      throw new APIError(
        402,
        ErrorCodes.PAYMENT_GATEWAY_ERROR,
        data.message || 'Failed to initialize payment with payment provider'
      )
    }

    // Update purchase with Paystack response
    await supabaseAdmin
      .from('one_time_purchases')
      .update({ 
        paystack_response: data,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id)

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'one_time_payment_initialized',
      resource_type: 'one_time_purchase',
      resource_id: purchase.id,
      changes: { 
        status: 'pending', 
        amount: amount / 100,
        product: product.name
      }
    })

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
      access_code: data.data.access_code,
      correlationId,
    })

  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/payments/one-time',
      method: 'POST'
    })
  }
}
