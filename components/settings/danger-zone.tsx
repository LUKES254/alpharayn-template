"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getCSRFToken } from "@/lib/csrf-client"

interface DangerZoneProps {
  userId: string
}

export function DangerZone({ userId }: DangerZoneProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      alert("Please type DELETE to confirm")
      return
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.")) {
      return
    }

    setDeleting(true)
    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Failed to get security token. Please refresh the page and try again.')
      }

      // Delete account via API FIRST (while still authenticated)
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      // Sign out AFTER successful deletion
      await authClient.signOut()
      
      // Redirect to home
      window.location.href = "/"
    } catch (error) {
      console.error('Error deleting account:', error)
      alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}. Please contact support.`)
      setDeleting(false)
    }
  }

  return (
    <Card className="border-red-100 shadow-sm bg-red-50/30">
      <CardHeader>
        <CardTitle className="text-red-600">Delete Account</CardTitle>
        <CardDescription>
          Permanently remove your account and all of its contents from the platform. This action is not reversible, so please continue with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-white p-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="confirm-delete" className="block text-sm font-medium text-gray-700 mb-2">
                To verify, type <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">DELETE</span> in the box below:
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                placeholder="Type DELETE here"
                autoComplete="off"
              />
              {confirmText && confirmText !== "DELETE" && (
                <p className="text-xs text-red-600 mt-1">Please type DELETE exactly as shown</p>
              )}
            </div>
            
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || confirmText !== "DELETE"}
              className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting Account...' : 'Delete Account'}
            </Button>
            {confirmText !== "DELETE" && !deleting && (
              <p className="text-xs text-gray-500 mt-1">Button will be enabled once you type DELETE above</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
