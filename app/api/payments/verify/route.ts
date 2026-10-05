import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Payment verification failed' },
        { status: 400 }
      )
    }
    
    // Update payment status in database using service role
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: data.data.status === 'success' ? 'success' : 'failed',
        paystack_response: data.data,
        updated_at: new Date().toISOString()
      })
      .eq('paystack_reference', reference)

    if (updateError) {
      console.error('Payment update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment record' },
        { status: 500 }
      )
    }

    // Fetch payment to get intended tier and user
    const { data: paymentRow } = await supabaseAdmin
      .from('payments')
      .select('user_id, metadata')
      .eq('paystack_reference', reference)
      .single()

    console.log('Payment verification:', {
      paystackStatus: data.data.status,
      reference,
      userId: paymentRow?.user_id,
      intendedTier: paymentRow?.metadata?.tier,
      fullMetadata: paymentRow?.metadata
    })

    if (data.data.status === 'success' && paymentRow?.user_id) {
      const intendedTier = paymentRow.metadata?.tier
      console.log('Checking tier upgrade eligibility:', {
        intendedTier,
        isValid: intendedTier && ['pro', 'premium'].includes(intendedTier)
      })
      
      if (intendedTier && ['pro', 'premium'].includes(intendedTier)) {
        console.log(`Attempting to update user ${paymentRow.user_id} to ${intendedTier}`)
        
        const { data: updateResult, error: tierUpdateError } = await supabaseAdmin
          .from('users')
          .update({ subscription_tier: intendedTier, updated_at: new Date().toISOString() })
          .eq('id', paymentRow.user_id)
          .select()
        
        if (tierUpdateError) {
          console.error('❌ Failed to update subscription tier:', tierUpdateError)
        } else {
          console.log(`✅ Successfully updated user ${paymentRow.user_id} to ${intendedTier}`)
          console.log('Update result:', updateResult)
          
          // Force revalidate dashboard and payment pages to show updated subscription
          revalidatePath('/dashboard')
          revalidatePath('/dashboard/payment')
        }

        // Log the subscription upgrade
        await supabaseAdmin.from('audit_logs').insert({
          user_id: paymentRow.user_id,
          action: 'subscription_upgraded',
          resource_type: 'user',
          resource_id: paymentRow.user_id,
          changes: { 
            old_tier: 'free',
            new_tier: intendedTier,
            payment_reference: reference 
          }
        })
      }
    }

    return NextResponse.json({
      status: data.data.status,
      reference: data.data.reference,
      amount: data.data.amount,
      message: data.data.gateway_response,
      tier: paymentRow?.metadata?.tier // Include the tier in response
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}