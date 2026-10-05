"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn, formatCurrency } from "@/lib/utils"
import dynamic from "next/dynamic"
import { useEffect, useState, useRef } from "react"
import { authClient } from "@/lib/auth-client"

// Dynamically import lucide icons (client-only)
const Home = dynamic(() => import("lucide-react").then((m) => m.Home), { ssr: false })
const CreditCard = dynamic(() => import("lucide-react").then((m) => m.CreditCard), { ssr: false })
const Users = dynamic(() => import("lucide-react").then((m) => m.Users), { ssr: false })
const Settings = dynamic(() => import("lucide-react").then((m) => m.Settings), { ssr: false })
const BarChart3 = dynamic(() => import("lucide-react").then((m) => m.BarChart3), { ssr: false })
const Shield = dynamic(() => import("lucide-react").then((m) => m.Shield), { ssr: false })
const FileText = dynamic(() => import("lucide-react").then((m) => m.FileText), { ssr: false })
const Mail = dynamic(() => import("lucide-react").then((m) => m.Mail), { ssr: false })
const Megaphone = dynamic(() => import("lucide-react").then((m) => m.Megaphone), { ssr: false })
const LogOut = dynamic(() => import("lucide-react").then((m) => m.LogOut), { ssr: false })
const Sparkles = dynamic(() => import("lucide-react").then((m) => m.Sparkles), { ssr: false })

// Empty user nav items as requested to remove visible links
const userNavItems: { href: string; label: string; icon: any }[] = []

const adminNavItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/payments", label: "All Payments", icon: CreditCard },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/waitlist", label: "Waitlist", icon: Megaphone },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface DashboardSidebarProps {
  userRole?: "user" | "admin"
  user?: {
    name: string
    email: string
    image: string
    plan: string
    totalSpent?: number
  }
}

export function DashboardSidebar({ userRole = "user", user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = userRole === "admin" ? adminNavItems : userNavItems
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push("/")
    } catch (e) {
      console.error("Sign out failed", e)
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || "User"
  const displayEmail = user?.email || ""
  const displayPlan = user?.plan || "Free"
  const displaySpent = user?.totalSpent || 0
  const userInitials = displayName.substring(0, 2).toUpperCase()

  return (
    <div className="w-64 h-full flex flex-col bg-white dark:bg-gray-900 shadow-lg border-r dark:border-gray-800 transition-colors" style={{ minHeight: 0 }}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">SaaS Platform</h2>
        {userRole === "admin" && (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
            ADMIN
          </span>
        )}
      </div>
      
      <nav className="flex-1 mt-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
                isActive && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-r-2 border-blue-500 dark:border-blue-400"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 relative" ref={profileRef}>
          {isProfileOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-2 right-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
              <div className="px-2 py-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{displayEmail.split('@')[0]}</p>
              </div>

              {/* Your Account Box */}
              <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg p-3 mb-2 border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Your Account</p>
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Current Plan</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 uppercase">{displayPlan}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Total Spent</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(displaySpent)}</span>
                   </div>
                </div>
              </div>
              
              <Link 
                href="/dashboard/payment" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              >
                 <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                 Upgrade plan
              </Link>
              
               {/* Visual separator/usage bar effect */}
              <div className="mx-2 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-1 overflow-hidden">
                 <div className="h-full w-1/3 bg-amber-500 rounded-full" />
              </div>

              <Link 
                href="/dashboard/settings" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                 <Settings className="w-4 h-4 mr-2" />
                 Settings
              </Link>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              
              <button 
                onClick={handleSignOut} 
                className="w-full flex items-center px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                 <LogOut className="w-4 h-4 mr-2" />
                 Log out
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
             <button 
               onClick={() => setIsProfileOpen(!isProfileOpen)}
               className="flex-1 flex items-center min-w-0 gap-3 text-left focus:outline-none"
             >
               <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                  {userInitials}
               </div>
               <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{displayPlan}</p>
               </div>
             </button>
             
             {displayPlan.toLowerCase() === 'free' && (
                <Link 
                  href="/dashboard/payment"
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm shrink-0"
                >
                  Upgrade
                </Link>
             )}
          </div>
        </div>
      )}
    </div>
  )
}