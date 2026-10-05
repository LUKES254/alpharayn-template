import { NewsletterPreferences } from '@/components/newsletter/newsletter-preferences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmailPreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Preferences</h1>
        <p className="text-muted-foreground">Control the updates you receive.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Newsletter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsletterPreferences />
        </CardContent>
      </Card>
    </div>
  )
}
