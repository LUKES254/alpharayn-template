"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [reference, setReference] = useState<string>('')
  const [tier, setTier] = useState<string>('')
  const [autoRedirect, setAutoRedirect] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('reference')
    if (ref) {
      setReference(ref)
      // Verify payment status
      verifyPayment(ref)
    } else {
      setStatus('failed')
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/payments/verify?reference=${reference}`)
      const data = await response.json()
      
      if (data.status === 'success') {
        setStatus('success')
        setTier(data.tier || '')
        setAutoRedirect(true)
        // Auto-redirect to dashboard after 3 seconds to show success message
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh() // Force refresh to reload server component data
        }, 3000)
      } else {
        setStatus('failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Processing Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we confirm your payment'}
            {status === 'success' && `Your subscription has been upgraded to ${tier?.toUpperCase() || 'premium'}`}
            {status === 'failed' && 'There was an issue processing your payment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="text-green-600 text-6xl">✓</div>
                <div>
                  <p className="text-lg font-semibold text-green-700">
                    Welcome to {tier?.toUpperCase() || 'Premium'}!
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Reference: {reference}</p>
                </div>
                {autoRedirect && (
                  <p className="text-sm text-blue-600 animate-pulse">
                    Redirecting to dashboard in 3 seconds...
                  </p>
                )}
                <Button 
                  onClick={() => {
                    router.push('/dashboard/payment')
                    router.refresh()
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View My Subscription
                </Button>
              </div>
            )}
            
            {status === 'failed' && (
              <div className="text-center space-y-4">
                <div className="text-red-600 text-6xl">✗</div>
                <p>Reference: {reference}</p>
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">Processing payment...</CardContent>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}