'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function NewsletterConfirmContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')

  useEffect(() => {
    async function confirm() {
      if (!token) return setStatus('error')
      const res = await fetch('/api/newsletter/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'public' },
        body: JSON.stringify({ token }),
      })
      setStatus(res.ok ? 'success' : 'error')
    }
    confirm()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black px-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Confirming...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'pending' && <p className="text-muted-foreground">Hang tight while we confirm your subscription.</p>}
          {status === 'success' && <p className="text-green-600 dark:text-green-400">You're subscribed! 🎉</p>}
          {status === 'error' && <p className="text-red-600 dark:text-red-400">Invalid or expired link.</p>}
          <Button asChild variant="outline"><Link href="/dashboard/settings/email-preferences">Go to preferences</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </div>
    }>
      <NewsletterConfirmContent />
    </Suspense>
  )
}
