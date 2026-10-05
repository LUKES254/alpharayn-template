import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/client"
import { sendEmail } from "@/lib/email"
import { emailTemplates } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user details
    const supabase = await createClient()
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Send welcome email
    const { subject, html, text } = emailTemplates.welcome(
      user.name || user.email,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

    await sendEmail({
      to: user.email,
      subject,
      html,
      text
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}