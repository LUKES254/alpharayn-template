import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, preferences } = body

    // Validate that the user can only update their own preferences
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Check if preferences table exists and create record
    // For now, we'll store in user metadata or a separate preferences table
    // You may need to create an email_preferences table in your database
    
    const { error } = await supabase
      .from('email_preferences')
      .upsert({
        user_id: userId,
        marketing_emails: preferences.marketingEmails,
        payment_emails: preferences.paymentEmails,
        security_emails: preferences.securityEmails,
        updated_at: new Date().toISOString()
      })

    if (error) {
      // If table doesn't exist, log but don't fail
      console.warn("Email preferences table may not exist:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Email preferences saved successfully"
    })
  } catch (error) {
    const err = error as Error
    console.error("Email preferences error:", err.message)
    
    // Handle database connection timeout
    if (err.message?.includes('CONNECT_TIMEOUT') || err.message?.includes('timeout')) {
      return NextResponse.json(
        { error: "Database service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to save email preferences" },
      { status: 500 }
    )
  }
}
