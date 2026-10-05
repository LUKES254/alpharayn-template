'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CampaignCreateSchema, CampaignCreateInput } from '@/lib/validation/newsletter-schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  onSaved?: () => void
}

export function CampaignForm({ onSaved }: Props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const form = useForm<CampaignCreateInput>({ resolver: zodResolver(CampaignCreateSchema), defaultValues: { title: '', subject: '', preview_text: '', content: '' } })

  async function onSubmit(values: CampaignCreateInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/newsletter/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'session' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Failed to save campaign')
      toast({ title: 'Campaign saved' })
      onSaved?.()
      form.reset()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <Input placeholder="Title" {...form.register('title')} disabled={loading} />
      <Input placeholder="Subject" {...form.register('subject')} disabled={loading} />
      <Input placeholder="Preview text" {...form.register('preview_text')} disabled={loading} />
      <Textarea rows={8} placeholder="Email content (HTML or markdown)" {...form.register('content')} disabled={loading} />
      <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Send now'}</Button>
    </form>
  )
}
