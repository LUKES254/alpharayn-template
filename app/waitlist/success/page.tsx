import { Suspense } from 'react'
import { WaitlistPositionDisplay } from '@/components/waitlist/waitlist-position-display'
import { ReferralShareBox } from '@/components/waitlist/referral-share-box'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SuccessContent() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const position = Number(params.get('pos') || '0') || 0
  const code = params.get('code') || ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const referralUrl = `${appUrl || ''}/waitlist?ref=${code}`

  return (
    <div className="space-y-6 text-center">
      <div className="text-4xl font-bold">You're on the list! 🎉</div>
      <WaitlistPositionDisplay position={position || 1} referralCount={0} />
      <div className="space-y-3">
        <div className="text-lg font-semibold">Skip the line</div>
        <ReferralShareBox referralUrl={referralUrl} referralCode={code} />
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Refer 5 friends to jump 50 spots.</p>
        <p>Invites roll out weekly.</p>
      </div>
      <Button asChild><Link href="/">Back to home</Link></Button>
    </div>
  )
}

export default function WaitlistSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black px-4">
      <div className="max-w-2xl w-full py-16">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
