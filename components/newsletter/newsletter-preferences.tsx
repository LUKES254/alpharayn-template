'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { NewsletterUpdatePreferencesSchema, NewsletterUpdatePreferencesInput } from '@/lib/validation/newsletter-schema'

export function NewsletterPreferences() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState({ product_updates: true, blog_posts: true, promotions: false })
  const [status, setStatus] = useState<'active' | 'unsubscribed' | 'bounced' | 'pending'>('pending')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch('/api/user/newsletter')
      if (res.ok) {
        const data = await res.json()
        setStatus(data.status)
        setPrefs(data.preferences || prefs)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save(updates: Partial<NewsletterUpdatePreferencesInput['preferences']> = {}) {
    setSaving(true)
    try {
      const merged = { ...prefs, ...updates }
      const parsed = NewsletterUpdatePreferencesSchema.parse({ preferences: merged })
      const res = await fetch('/api/user/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'session' },
        body: JSON.stringify(parsed),
      })
      if (!res.ok) throw new Error('Failed to save')
      setPrefs(merged)
      toast({ title: 'Preferences saved' })
    } catch (err) {
      toast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Please try again', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function unsubscribeAll() {
    await save({ product_updates: false, blog_posts: false, promotions: false })
    setStatus('unsubscribed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Product updates</p>
            <p className="text-sm text-muted-foreground">Roadmap drops, new features.</p>
          </div>
          <Switch checked={prefs.product_updates} disabled={loading} onCheckedChange={(checked) => save({ product_updates: checked })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Blog posts</p>
            <p className="text-sm text-muted-foreground">Latest guides and articles.</p>
          </div>
          <Switch checked={prefs.blog_posts} disabled={loading} onCheckedChange={(checked) => save({ blog_posts: checked })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Promotions</p>
            <p className="text-sm text-muted-foreground">Discounts and offers.</p>
          </div>
          <Switch checked={prefs.promotions} disabled={loading} onCheckedChange={(checked) => save({ promotions: checked })} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">Status: <span className="font-semibold text-foreground">{status}</span></div>
          <Button variant="destructive" size="sm" onClick={unsubscribeAll} disabled={saving}>Unsubscribe from all</Button>
        </div>
      </CardContent>
    </Card>
  )
}
