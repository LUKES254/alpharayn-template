'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Zap, Menu } from "lucide-react"
import { useState } from "react"

export function WaitlistNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ideacloner</span>
            </Link>
          </div>

          {/* Blog - Center (hidden on mobile) */}
          <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/blog" 
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Join Waitlist Button - Right (hidden on mobile) */}
          <div className="hidden sm:flex items-center">
            <Link href="#waitlist">
              <Button 
                size="default" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Join the waitlist
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
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
                      href="/blog" 
                      className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Blog
                    </Link>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <Link href="#waitlist" onClick={() => setOpen(false)} className="block">
                      <Button 
                        size="lg" 
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        Join the waitlist
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
