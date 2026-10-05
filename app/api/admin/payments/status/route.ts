import { NextRequest, NextResponse } from "next/server"
import { getSession, requireRole } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin")
    const session = await getSession()
    const { paymentId, status, reason, reference } = await request.json()

    if (!paymentId || !status || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update payment status using admin client
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)

    if (updateError) {
      console.error('Payment status update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // Log the status change
    await supabaseAdmin.from('audit_logs').insert({
      user_id: session.user.id,
      action: 'payment_status_updated',
      resource_type: 'payment',
      resource_id: paymentId,
      changes: {
        new_status: status,
        reason,
        reference
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Payment status update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}