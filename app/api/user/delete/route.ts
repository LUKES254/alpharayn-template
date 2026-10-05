import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function DELETE(request: NextRequest) {
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

    const userId = session.user.id

    // Use admin client to bypass RLS policies
    // Database structure:
    // - public.user (BetterAuth) has CASCADE to session & account
    // - sync_better_auth_user trigger cascades delete to public.users
    // - public.users has CASCADE to payments, subscriptions, briefs
    // - audit_logs.user_id is SET NULL
    
    // Step 1: Delete verification tokens (not cascade-linked)
    const { error: verificationError } = await supabaseAdmin
      .from('verification')
      .delete()
      .eq('identifier', session.user.email)
    
    if (verificationError && verificationError.code !== 'PGRST116') {
      console.warn("Warning deleting verification tokens:", verificationError)
      // Don't fail - continue with user deletion
    }

    // Step 2: Delete from public.user (everything else cascades automatically)
    // This triggers:
    // - CASCADE delete of sessions and accounts (FK from public.user)
    // - sync_better_auth_user trigger deletes from public.users
    // - CASCADE delete of payments, subscriptions, briefs (FK from public.users)
    // - SET NULL on audit_logs.user_id
    const { error: userError } = await supabaseAdmin
      .from('user')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error("Error deleting user:", userError)
      return NextResponse.json(
        { error: `Failed to delete user account: ${userError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    })
  } catch (error) {
    const err = error as Error
    console.error("Account deletion error:", err.message)
    
    // Handle database connection timeout
    if (err.message?.includes('CONNECT_TIMEOUT') || err.message?.includes('timeout')) {
      return NextResponse.json(
        { error: "Database service temporarily unavailable. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to delete account: ${err.message}` },
      { status: 500 }
    )
  }
}
