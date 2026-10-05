import { NewsletterSubscribeForm } from '@/components/newsletter/newsletter-subscribe-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewsletterSubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Subscribe to our newsletter</CardTitle>
          <p className="text-sm text-muted-foreground">Product updates, launch notes, and promotions.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <NewsletterSubscribeForm source="newsletter-page" />
          <p className="text-xs text-muted-foreground">We respect your inbox. Unsubscribe anytime.</p>
        </CardContent>
      </Card>
    </div>
  )
}
