'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriberTable } from '@/components/newsletter/subscriber-table'
import { CampaignTable } from '@/components/newsletter/campaign-table'
import { CampaignForm } from '@/components/newsletter/campaign-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function AdminNewsletterPage() {
  const { toast } = useToast()
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  async function loadSubscribers() {
    const res = await fetch('/api/admin/newsletter/subscribers')
    if (res.ok) {
      const data = await res.json()
      setSubscribers(data.subscribers)
    }
  }

  async function loadCampaigns() {
    const res = await fetch('/api/admin/newsletter/campaigns')
    if (res.ok) {
      const data = await res.json()
      setCampaigns(data.campaigns)
    }
  }

  useEffect(() => {
    loadSubscribers()
    loadCampaigns()
  }, [])

  async function deleteCampaign(id: string) {
    const res = await fetch(`/api/admin/newsletter/campaigns/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': 'session' } })
    if (res.ok) {
      toast({ title: 'Campaign deleted' })
      loadCampaigns()
    } else {
      toast({ title: 'Unable to delete', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">Manage subscribers and campaigns.</p>
        </div>
      </div>
      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Coming soon</CardTitle>
            </CardHeader>
            <CardContent>Subscribers dashboard placeholder.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Coming soon</CardTitle>
            </CardHeader>
            <CardContent>Campaigns dashboard placeholder.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Coming soon</CardTitle>
            </CardHeader>
            <CardContent>Analytics dashboard placeholder.</CardContent>
          </Card>
        </TabsContent>
      
      </Tabs>
    </div>
  )
}
