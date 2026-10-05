"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")

  const handleResend = async () => {
    if (!email) return
    
    setResending(true)
    setMessage("")
    
    try {
      // Resend verification email
      await authClient.sendVerificationEmail({ email })
      setMessage("Verification email sent! Check your inbox.")
    } catch (error) {
      setMessage("Failed to resend email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to {email || "your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Click the link in the email to verify your account and start using the platform.
            </p>
            <p className="text-sm text-gray-600">
              Can't find the email? Check your spam folder.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <Button
            onClick={handleResend}
            disabled={resending || !email}
            variant="outline"
            className="w-full"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>

          <div className="text-center">
            <a href="/auth/sign-in" className="text-sm text-blue-600 hover:underline">
              Back to Sign In
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
