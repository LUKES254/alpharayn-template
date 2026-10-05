"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ========================================
// AUTH METHODS CONFIGURATION
// Comment out any method to disable it
// ========================================
const AUTH_METHODS = {
  EMAIL_PASSWORD: true,    // Email & Password authentication
  MAGIC_LINK: true,        // Magic Link (passwordless) authentication
  GOOGLE: true,            // Google OAuth
  GITHUB: false,            // GitHub OAuth
}
// ========================================

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  
  // Check which auth methods are enabled
  const showEmailPassword = AUTH_METHODS.EMAIL_PASSWORD
  const showMagicLink = AUTH_METHODS.MAGIC_LINK
  const showGoogleAuth = AUTH_METHODS.GOOGLE && !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const showGithubAuth = AUTH_METHODS.GITHUB && !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let response
      if (mode === "sign-up") {
        response = await authClient.signUp.email({
          email,
          password,
          name,
        })
      } else {
        response = await authClient.signIn.email({
          email,
          password,
        })
      }
      
      console.log("Auth response:", response)
      
      // Check if there's an error in the response
      if (response?.error) {
        setError(response.error.message || "Authentication failed")
        setLoading(false)
        return
      }

      // If user exists but is not verified, sign out and send to verify page
      const user = response?.data?.user as any
      if (user && user.emailVerified === false) {
        try { await authClient.signOut() } catch {}
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`
        return
      }
      
      // Stay on the landing page and let the navbar reflect session state
      window.location.href = "/"
    } catch (err) {
      console.error("Auth error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      })
    } catch (err) {
      console.error("Social sign in error:", err)
      setError(err instanceof Error ? err.message : "Social sign in failed")
    }
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await authClient.signIn.magicLink({
        email,
        name: mode === "sign-up" ? name : undefined,
        callbackURL: "/",
      })

      if (error) {
        setError(error.message || "Failed to send magic link")
        return
      }

      // Show success message
      setMagicLinkSent(true)
    } catch (err) {
      console.error("Magic link error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {process.env.NEXT_PUBLIC_APP_NAME?.charAt(0) || "S"}
            </span>
          </div>
          <span className="text-2xl font-semibold text-foreground">
            {process.env.NEXT_PUBLIC_APP_NAME || "ideacloner"}
          </span>
        </div>
      </div>

      {/* Magic Link Success Message */}
      {magicLinkSent ? (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Check Your Email</h3>
          <p className="text-muted-foreground">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in. The link expires in 5 minutes.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setMagicLinkSent(false)
              setUseMagicLink(false)
            }}
            className="mt-4"
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <>
          {/* Form */}
          <form onSubmit={useMagicLink ? handleMagicLinkSubmit : handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        {showEmailPassword && showMagicLink && (
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {useMagicLink ? "🔑 Use password instead" : "✨ Use magic link instead"}
            </Button>
          </div>
        )}

        {(showEmailPassword || showMagicLink) && (
          <>
            {mode === "sign-up" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-12 bg-background"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-background"
                />
              </div>
            </div>

            {!useMagicLink && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your secret password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-background"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading 
                ? "Loading..." 
                : useMagicLink 
                  ? "✨ Send Magic Link" 
                  : mode === "sign-in" 
                    ? "Login" 
                    : "Create account"
              }
            </Button>
          </>
        )}

        {showGoogleAuth && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={loading}
            className="w-full h-12 border-2"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign {mode === "sign-in" ? "in" : "up"} with Google
          </Button>
        )}

        {showGithubAuth && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("github")}
            disabled={loading}
            className="w-full h-12 border-2"
          >
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign {mode === "sign-in" ? "in" : "up"} with GitHub
          </Button>
        )}
      </form>
      </>
      )}

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-3">
        {mode === "sign-in" && (
          <p className="text-sm text-muted-foreground">
            Did you forget your password?{" "}
            <Link href="/auth/reset-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Reset it now
            </Link>
          </p>
        )}
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            {mode === "sign-in" ? "Don't have an account yet?" : "Already have an account?"}
          </p>
          <Link 
            href={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            {mode === "sign-in" ? "Create a new one" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  )
}