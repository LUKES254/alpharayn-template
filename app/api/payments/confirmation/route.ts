import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"
import { formatDate } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch payment with user details
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .eq('id', paymentId)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Send payment confirmation email
    const { subject, html, text } = emailTemplates.paymentConfirmation(
      payment.users.name || payment.users.email,
      payment.amount,
      payment.currency,
      payment.paystack_reference,
      formatDate(payment.created_at)
    )

    await sendEmail({
      to: payment.users.email,
      subject,
      html,
      text
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Payment confirmation email error:', error)
    return NextResponse.json(
      { error: 'Failed to send payment confirmation' },
      { status: 500 }
    )
  }
}