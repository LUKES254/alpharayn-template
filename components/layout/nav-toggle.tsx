import Link from "next/link"
import { Zap } from "lucide-react"
import { WaitlistNav } from "@/components/layout/waitlist-nav"
import LandingNavUser from "@/components/layout/landing-nav-user"
import { MobileNav } from "@/components/layout/mobile-nav"

/**
 * NavToggle Component
 * 
 * Toggle between two navigation styles on the landing page:
 * - Set SHOW_WAITLIST_NAV to `true` for the waitlist navigation (simple: logo, blog, join button)
 * - Set SHOW_WAITLIST_NAV to `false` for the main navigation (full nav with pricing, auth buttons)
 */
const SHOW_WAITLIST_NAV = false

export async function NavToggle() {
  if (SHOW_WAITLIST_NAV) {
    return <WaitlistNav />
  }

  // Main Navigation
  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ideacloner</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Blog
            </Link>
          </div>
          <div className="hidden md:flex">
            <LandingNavUser />
          </div>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
}
