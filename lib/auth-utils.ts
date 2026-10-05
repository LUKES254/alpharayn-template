import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getSession() {
  try {
    // Use the server-side auth instance
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session) {
      redirect("/auth/sign-in")
    }
    // Ensure admins are premium on every access (idempotent)
    // Ensure admin upgrade happens asynchronously; ignore transient connection errors
    try {
      await ensureAdminPremium(session.user.id, session.user.email)
    } catch (e) {
      console.warn('Failed admin premium ensure (non-fatal):', (e as Error).message)
    }
    return session
  } catch (error) {
    const err = error as Error
    // Handle database connection timeout gracefully
    if (err.message?.includes('CONNECT_TIMEOUT') || err.message?.includes('Failed to get session')) {
      console.error('Database connection timeout:', err.message)
      // Redirect to error page instead of crashing
      redirect("/unauthorized?error=database_unavailable")
    }
    throw error
  }
}

// Non-redirecting version for layouts/navbars
export async function tryGetSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session ?? null
  } catch (error) {
    const err = error as Error
    // Silently handle database connection errors in non-critical contexts
    if (err.message?.includes('CONNECT_TIMEOUT')) {
      console.warn('Database connection timeout in tryGetSession:', err.message)
      return null
    }
    // Re-throw other unexpected errors
    throw error
  }
}

export async function getUserRole() {
  const session = await getSession()
  
  // For now, check if user email is admin
  // TODO: Add proper role management system
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  
  if (adminEmails.includes(session.user.email)) {
    return 'admin'
  }
  
  return 'user'
}

export async function getUserRoleOptional() {
  const session = await tryGetSession()
  if (!session) return null
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(session.user.email) ? 'admin' : 'user'
}

export async function requireRole(requiredRole: string) {
  const userRole = await getUserRole()
  if (userRole !== requiredRole) {
    redirect("/unauthorized")
  }
}

export async function ensureAdminPremium(userId: string, userEmail: string) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
  if (!adminEmails.includes(userEmail)) return
  await supabaseAdmin
    .from('users')
    .update({ subscription_tier: 'premium' })
    .eq('id', userId)
}