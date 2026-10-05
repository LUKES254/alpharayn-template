import { ReactNode } from "react"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardMobileSidebar } from "@/components/layout/dashboard-mobile-sidebar"
import { getSession } from "@/lib/auth-utils"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface DashboardLayoutProps {
  children: ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Fetch session and user role
  const session = await getSession()
  const userRole = (process.env.ADMIN_EMAILS?.split(',').includes(session.user.email) ? 'admin' : 'user') as "user" | "admin"

  // Fetch user subscription tier
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single()
  
  const userPlan = (userData?.subscription_tier || 'free') as string

  // Fetch user's recent payments for sidebar stats
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalSpent = payments?.reduce((sum, payment) => 
    payment.status === 'success' ? sum + payment.amount : sum, 0
  ) || 0

  const user = {
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image || '',
    plan: userPlan,
    totalSpent: totalSpent
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar userRole={userRole} user={user} />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <DashboardMobileSidebar userRole={userRole} user={user} />
        </div>
        <DashboardHeader />
        <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}