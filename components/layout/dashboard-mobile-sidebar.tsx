"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { useState } from "react"

interface DashboardMobileSidebarProps {
  userRole?: "user" | "admin"
  user?: {
    name: string
    email: string
    image: string
    plan: string
    totalSpent?: number
  }
}

export function DashboardMobileSidebar({ userRole, user }: DashboardMobileSidebarProps) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <DashboardSidebar userRole={userRole} user={user} />
      </SheetContent>
    </Sheet>
  )
}
