'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Copy, Share2 } from 'lucide-react'

interface Props {
  referralUrl: string
  referralCode: string
}

export function ReferralShareBox({ referralUrl, referralCode }: Props) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    toast({ title: 'Copied', description: 'Referral link copied' })
    setTimeout(() => setCopied(false), 1500)
  }

  const tweet = encodeURIComponent(`I'm #${referralCode} on the waitlist. Join me: ${referralUrl}`)
  const li = encodeURIComponent(referralUrl)
  const wa = encodeURIComponent(`Join me on this waitlist: ${referralUrl}`)

  return (
    <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
      <div className="text-sm font-medium">Your referral link</div>
      <div className="flex gap-2">
        <Input readOnly value={referralUrl} />
        <Button type="button" variant="secondary" onClick={copy} aria-label="Copy referral link">
          <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild><a href={`https://twitter.com/intent/tweet?text=${tweet}`} target="_blank" rel="noreferrer"><Share2 className="h-4 w-4 mr-1"/>Twitter</a></Button>
        <Button variant="outline" size="sm" asChild><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${li}`} target="_blank" rel="noreferrer">LinkedIn</a></Button>
        <Button variant="outline" size="sm" asChild><a href={`https://api.whatsapp.com/send?text=${wa}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
        <Button variant="outline" size="sm" asChild><a href={`mailto:?subject=Join the waitlist&body=${encodeURIComponent(referralUrl)}`}>Email</a></Button>
      </div>
    </div>
  )
}
