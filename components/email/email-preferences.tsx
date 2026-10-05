"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, CreditCard, ShieldAlert } from "lucide-react"

interface EmailPreferencesProps {
  userId: string
  initialPreferences?: {
    marketingEmails: boolean
    paymentEmails: boolean
    securityEmails: boolean
  }
}

export function EmailPreferences({ userId, initialPreferences }: EmailPreferencesProps) {
  const [preferences, setPreferences] = useState({
    marketingEmails: initialPreferences?.marketingEmails ?? true,
    paymentEmails: initialPreferences?.paymentEmails ?? true,
    securityEmails: initialPreferences?.securityEmails ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/email-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      alert('Email preferences saved successfully!')
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save email preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Choose which types of emails you'd like to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
            <Mail className="mt-1 h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing-emails" className="font-medium">Marketing Emails</Label>
                <Switch
                  id="marketing-emails"
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, marketingEmails: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features, promotions, and news.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
            <CreditCard className="mt-1 h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-emails" className="font-medium">Payment Emails</Label>
                <Switch
                  id="payment-emails"
                  checked={preferences.paymentEmails}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, paymentEmails: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive receipts and payment confirmations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
            <ShieldAlert className="mt-1 h-5 w-5 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="security-emails" className="font-medium">Security Emails</Label>
                <Switch
                  id="security-emails"
                  checked={preferences.securityEmails}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, securityEmails: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Receive important security notifications.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}