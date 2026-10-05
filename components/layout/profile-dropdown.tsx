"use client"

import { useState, useEffect, useRef } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileDropdownProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null | undefined
  }
  role: string | null
}

export function ProfileDropdown({ user, role }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user.name || user.email.split("@")[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await authClient.signOut()
      // Return to landing page and refresh session state
      window.location.href = "/"
    } catch (e) {
      console.error("Sign out failed", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        className="flex items-center space-x-2"
        onClick={() => setOpen(o => !o)}
        disabled={loading}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
            {displayName.substring(0,2).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{displayName}</span>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50">
          <div className="py-2 text-sm">
            <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium truncate text-gray-900 dark:text-gray-100">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              {role === 'admin' && (
                <span className="mt-1 inline-block text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">ADMIN</span>
              )}
            </div>
            <button
              onClick={() => { 
                setOpen(false)
                router.push(role === 'admin' ? '/admin' : '/dashboard') 
              }}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleSignOut}
              className={cn("w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", loading && "opacity-50")}
              disabled={loading}
            >
              {loading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
