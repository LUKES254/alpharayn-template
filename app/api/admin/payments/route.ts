import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Disable caching for admin API
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin")

    // Fetch all payments with user information using admin client
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        users (
          id,
          email,
          name,
          subscription_tier
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Admin payments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}