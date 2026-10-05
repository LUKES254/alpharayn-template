'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WaitlistJoinSchema, WaitlistJoinInput } from '@/lib/validation/newsletter-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface Props {
  referredByCode?: string | null
}

export function WaitlistForm({ referredByCode }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [prefillRef, setPrefillRef] = useState<string | null>(referredByCode || null)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setPrefillRef(ref)
  }, [searchParams])

  const form = useForm<WaitlistJoinInput>({
    resolver: zodResolver(WaitlistJoinSchema),
    defaultValues: {
      email: '',
      full_name: '',
      referred_by_code: prefillRef || undefined,
      company: '',
      role: '',
      use_case: '',
      company_size: undefined,
      utm_source: searchParams.get('utm_source') || undefined,
      utm_medium: searchParams.get('utm_medium') || undefined,
      utm_campaign: searchParams.get('utm_campaign') || undefined,
    },
  })

  async function onSubmit(values: WaitlistJoinInput) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'public' },
        body: JSON.stringify(values),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to join waitlist')
      }
      const { position, referral_code } = payload
      router.push(`/waitlist/success?pos=${position}&code=${referral_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      toast({ title: 'Join failed', description: error || 'Try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="bg-red-950/50 border-red-800">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-5">
        <Input 
          placeholder="Name" 
          {...form.register('full_name')} 
          disabled={loading}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 h-14 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4"
        />
        
        <Input 
          placeholder="Company/Team" 
          {...form.register('company')} 
          disabled={loading}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 h-14 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4"
        />
        
        <Input 
          placeholder="Email address" 
          type="email" 
          {...form.register('email')} 
          disabled={loading}
          className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 h-14 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all text-base mt-6" 
        size="lg" 
        disabled={loading}
      >
        {loading ? 'Joining...' : 'Join the waitlist →'}
      </Button>
    </form>
  )
}
