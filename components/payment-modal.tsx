'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initializeOneTimePayment } from '@/app/actions/paystack'
import { Loader2 } from 'lucide-react'

export function PaymentModal() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<string>('149')
  const [currency, setCurrency] = useState<string>('USD')

  useEffect(() => {
    // Fetch the amount from Paystack when modal opens
    if (open) {
      fetchPaymentPageAmount()
    }
  }, [open])

  const fetchPaymentPageAmount = async () => {
    try {
      const pageSlug = process.env.NEXT_PUBLIC_PAYSTACK_PAYMENT_PAGE_SLUG
      if (!pageSlug) return

      const response = await fetch(`/api/payments/page-info`)
      if (response.ok) {
        const data = await response.json()
        if (data.amount) {
          // Convert from minor units to major units
          const majorAmount = (data.amount / 100).toFixed(2)
          setAmount(majorAmount)
          setCurrency(data.currency || 'USD')
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment amount:', error)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Server action handles the slug securely without exposing it to client
      const { authorization_url } = await initializeOneTimePayment(email)
      // Directly redirect to Paystack checkout
      window.location.href = authorization_url
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full mb-8 text-lg h-12">
          Get ideacloner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Get ideacloner</DialogTitle>
          <DialogDescription>
            Enter your email to proceed with the secure payment via Paystack.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePayment} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="alpharayih1@gmail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${currency === 'NGN' ? '₦' : currency === 'KES' ? 'KSh' : '$'}${amount}`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
