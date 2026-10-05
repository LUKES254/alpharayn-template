import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Query using admin client to bypass RLS
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_tier, updated_at')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier,
      lastUpdated: user.updated_at,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
