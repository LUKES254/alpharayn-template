'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewsletterSubscribeSchema, NewsletterSubscribeInput } from '@/lib/validation/newsletter-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Props {
  source?: string
  inline?: boolean
}

export function NewsletterSubscribeForm({ source = 'website', inline = false }: Props) {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const form = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(NewsletterSubscribeSchema),
    defaultValues: { email: '', source, preferences: { product_updates: true, blog_posts: true, promotions: false } },
  })

  async function onSubmit(values: NewsletterSubscribeInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'public' },
        body: JSON.stringify({ ...values, source }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to subscribe')
      }
      setSubmitted(true)
      toast({ title: 'Almost there', description: 'Check your email to confirm.' })
    } catch (err) {
      toast({ title: 'Subscription failed', description: err instanceof Error ? err.message : 'Please try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-center text-white">
        🎉 Check your inbox to confirm.
      </div>
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={inline ? 'flex flex-col sm:flex-row gap-3 items-start sm:items-center' : 'space-y-4'}
    >
      <div className={inline ? 'flex-1 w-full' : 'w-full space-y-3'}>
        <Input
          placeholder="you@example.com"
          type="email"
          disabled={loading}
          className={`${!inline ? 'bg-white border-gray-300 rounded-lg h-12 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition' : ''}`}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <Alert variant="destructive"><AlertDescription className="text-xs">{form.formState.errors.email.message}</AlertDescription></Alert>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={loading} 
        className={`${inline ? 'shrink-0' : 'w-full'} h-12 font-semibold bg-white text-purple-900 hover:bg-gray-100 transition`}
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </Button>
      <label className={`flex items-center gap-2 text-xs text-gray-200 ${inline ? '' : ''}`}>
        <Checkbox
          defaultChecked
          className="border-white/30 bg-white/10"
          onCheckedChange={(checked) => form.setValue('preferences', { ...form.getValues().preferences, promotions: checked === true })}
        />
        I agree to receive emails
      </label>
    </form>
  )
}
