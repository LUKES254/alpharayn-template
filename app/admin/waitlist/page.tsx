'use client'

import { useEffect, useState } from 'react'
import { WaitlistTable } from '@/components/waitlist/waitlist-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function AdminWaitlistPage() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, invited: 0, converted: 0, conversion_rate: 0 })

  async function load() {
    const res = await fetch('/api/admin/waitlist')
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries)
      setStats(data.stats)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleInvite(id: string) {
    const res = await fetch(`/api/admin/waitlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'session' },
      body: JSON.stringify({ status: 'invited' }),
    })
    if (res.ok) {
      toast({ title: 'Invite sent' })
      load()
    }
  }

  async function handlePriority(id: string, next: boolean) {
    const res = await fetch(`/api/admin/waitlist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'session' },
      body: JSON.stringify({ priority: next }),
    })
    if (res.ok) {
      toast({ title: next ? 'Priority set' : 'Priority removed' })
      load()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Waitlist</h1>
          <p className="text-muted-foreground">Manage early access signups.</p>
        </div>
        <Button variant="outline" onClick={() => window.open('/api/admin/waitlist/export', '_blank')}>Export CSV</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', val: stats.total },
          { label: 'Pending', val: stats.pending },
          { label: 'Approved', val: stats.approved },
          { label: 'Invited', val: stats.invited },
          { label: 'Converted', val: `${stats.conversion_rate}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.val}</div></CardContent>
          </Card>
        ))}
      </div>
      <WaitlistTable entries={entries} onInvite={handleInvite} onPriority={handlePriority} />
    </div>
  )
}
