'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await authClient.getSession()
      setSession(data)
      setLoading(false)
    }
    fetchSession()
  }, [])

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
        <Menu className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
        <div className="flex flex-col py-6">
          {/* Navigation Links */}
          <div className="space-y-1 mb-6">
            <Link 
              href="#pricing" 
              className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/blog" 
              className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Blog
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
            {!session ? (
              <>
                <Link href="/auth/sign-in" onClick={() => setOpen(false)} className="block">
                  <Button variant="outline" className="w-full h-11 font-medium border-gray-300 dark:border-gray-700" size="lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setOpen(false)} className="block">
                  <Button className="w-full h-11 font-medium" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="block">
                  <Button className="w-full h-11 font-medium" size="lg">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="block">
                  <Button variant="outline" className="w-full h-11 font-medium border-gray-300 dark:border-gray-700" size="lg">
                    Settings
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
