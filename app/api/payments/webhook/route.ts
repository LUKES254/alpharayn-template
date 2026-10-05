import { NextRequest, NextResponse } from "next/server"
import crypto from 'crypto'
import { supabaseAdmin } from "@/lib/supabase/admin"

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET!
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature || !verifyPaystackSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case 'charge.success': {
        const { reference, amount, status, paid_at, metadata } = event.data
        
        // Check if payment already processed (idempotency)
        const { data: existingPayment } = await supabaseAdmin
          .from('payments')
          .select('status')
          .eq('paystack_reference', reference)
          .single()

        if (!existingPayment) {
          console.error('Payment not found:', reference)
          return NextResponse.json(
            { error: 'Payment not found' },
            { status: 404 }
          )
        }

        // Skip if already processed
        if (existingPayment.status === 'success') {
          return NextResponse.json({ message: 'Already processed' })
        }

        // Update payment status
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'success',
            paystack_response: event.data,
            updated_at: new Date().toISOString()
          })
          .eq('paystack_reference', reference)

        if (updateError) {
          console.error('Payment update error:', updateError)
          return NextResponse.json(
            { error: 'Failed to update payment' },
            { status: 500 }
          )
        }

        // Log the successful payment
        await supabaseAdmin.from('audit_logs').insert({
          user_id: metadata?.userId,
          action: 'payment_success',
          resource_type: 'payment',
          resource_id: metadata?.paymentId,
          changes: { 
            status: 'success', 
            amount: amount / 100,
            paid_at 
          }
        })

        // Upgrade subscription tier using service role
        const tier = metadata?.tier
        if (tier && ['pro','premium'].includes(tier) && metadata?.userId) {
          await supabaseAdmin
            .from('users')
            .update({ subscription_tier: tier })
            .eq('id', metadata.userId)
        }

        break
      }

      case 'charge.failed': {
        const { reference, status } = event.data
        
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            paystack_response: event.data,
            updated_at: new Date().toISOString()
          })
          .eq('paystack_reference', reference)

        break
      }

      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}