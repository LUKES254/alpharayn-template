import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PLANS, type Tier } from "@/lib/plans"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const formData = await request.formData()
    const targetTier = formData.get('targetTier') as Tier

    if (!targetTier || !PLANS[targetTier]) {
      return NextResponse.json(
        { error: 'Invalid target tier' },
        { status: 400 }
      )
    }

    // Get current subscription
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching current subscription:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch current subscription' },
        { status: 500 }
      )
    }

    const currentTier = (currentUser?.subscription_tier || 'free') as Tier
    const tierOrder: Tier[] = ['free', 'pro', 'premium']
    const currentIndex = tierOrder.indexOf(currentTier)
    const targetIndex = tierOrder.indexOf(targetTier)

    // Validate that this is actually a downgrade
    if (targetIndex >= currentIndex) {
      return NextResponse.json(
        { error: 'Target tier must be lower than current tier' },
        { status: 400 }
      )
    }

    // Update subscription tier
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        subscription_tier: targetTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Error downgrading subscription:', updateError)
      return NextResponse.json(
        { error: 'Failed to downgrade subscription' },
        { status: 500 }
      )
    }

    // Log the downgrade/cancellation
    console.log('Subscription downgraded:', {
      userId: session.user.id,
      from: currentTier,
      to: targetTier,
      timestamp: new Date().toISOString()
    })

    // Redirect back to payment page with success message
    return NextResponse.redirect(
      new URL('/dashboard/payment?success=downgraded', request.url)
    )

  } catch (error) {
    console.error('Downgrade subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
