import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  
  const isDatabaseError = error === 'database_unavailable'
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDatabaseError ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <svg
              className={`w-6 h-6 ${isDatabaseError ? 'text-yellow-600' : 'text-red-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isDatabaseError 
                  ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                }
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">
            {isDatabaseError ? 'Service Unavailable' : 'Access Denied'}
          </CardTitle>
          <CardDescription>
            {isDatabaseError
              ? 'The database service is temporarily unavailable'
              : "You don't have permission to access this page"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {isDatabaseError
              ? 'We are experiencing temporary issues. Please try again in a few moments.'
              : 'This page requires special permissions. If you believe this is an error, please contact your administrator.'}
          </p>
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full">
                Go Home
              </Button>
            </Link>
            {!isDatabaseError && (
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
