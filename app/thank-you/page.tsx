'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { verifyOneTimePayment } from '@/app/actions/paystack'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!reference) {
      setStatus('error')
      setMessage('No payment reference found.')
      return
    }

    // Verify payment
    verifyOneTimePayment(reference)
      .then((result) => {
        if (result.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(result.message || 'Payment verification failed.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An unexpected error occurred.')
      })
  }, [reference])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            {status === 'loading' && (
                <div className="flex justify-center mb-4">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                </div>
            )}
            {status === 'success' && (
                <div className="flex justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
            )}
            {status === 'error' && (
                <div className="flex justify-center mb-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>
            )}
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Verifying Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we confirm your transaction.'}
            {status === 'success' && 'Thank you for your purchase. Check your email for next steps.'}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            {status === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm text-green-800 dark:text-green-200">
                    <p className="font-semibold mb-2">What happens now?</p>
                    <p>We&apos;ve sent an email to you. Please reply with your <strong>GitHub username</strong> to get access to the repository.</p>
                </div>
            )}
          <Link href="/">
            <Button className="w-full" variant={status === 'success' ? 'default' : 'secondary'}>
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ThankYouContent />
        </Suspense>
    )
}
