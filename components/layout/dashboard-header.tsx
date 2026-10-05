"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { ArrowLeft, Menu } from "lucide-react"
import { DashboardMobileSidebar } from "@/components/layout/dashboard-mobile-sidebar"

export function DashboardHeader() {
  const router = useRouter()
  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Hamburger for mobile is now in layout, so just keep back button and title */}
          <Link href="/" aria-label="Back to Home" className="inline-flex">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}