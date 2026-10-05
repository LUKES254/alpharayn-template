'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const dynamic = 'force-dynamic'

function NewsletterUnsubscribeContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle')

  useEffect(() => {
    if (token) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleSubmit() {
    const body: Record<string, string> = {}
    if (token) body.token = token
    if (!token && email) body.email = email
    if (!token && !email) return

    const res = await fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'public' },
      body: JSON.stringify(body),
    })
    setStatus(res.ok ? 'done' : 'error')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black px-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">We're sorry to see you go</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'done' && <Alert><AlertDescription>You have been unsubscribed.</AlertDescription></Alert>}
          {status === 'error' && <Alert variant="destructive"><AlertDescription>Could not unsubscribe. Try again.</AlertDescription></Alert>}
          {!token && (
            <>
              <Input placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Textarea placeholder="Tell us why (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="outline" asChild><a href="/newsletter/subscribe">Update preferences instead</a></Button>
                <Button variant="destructive" onClick={handleSubmit}>Unsubscribe</Button>
              </div>
            </>
          )}
          {token && status === 'idle' && <p className="text-muted-foreground">Processing your unsubscribe...</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      </div>
    }>
      <NewsletterUnsubscribeContent />
    </Suspense>
  )
}
