"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PLANS } from '@/lib/plans'
import { useRouter } from "next/navigation"
import { getCSRFToken } from '@/lib/csrf-client'
import { formatCurrency } from "@/lib/utils"

interface PaymentFormProps {
  plan: {
    id: string
    name: string
    price: number // major units (for display)
    description: string
    amountMinorUnits?: number // exact amount in minor units to charge
  }
  currency?: 'NGN' | 'KES' | 'USD'
}

export function PaymentForm({ plan, currency: currencyProp }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      const tier = plan.id as 'pro' | 'premium'
      const currency = (currencyProp || (process.env.NEXT_PUBLIC_CURRENCY || 'KES')).toUpperCase() as 'NGN' | 'KES'
      const amount = plan.amountMinorUnits ?? PLANS[tier].prices[currency]
      
      if (amount == null) {
        throw new Error(`Unsupported currency ${currency} for plan ${tier}`)
      }

      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Unable to get CSRF token. Please refresh and try again.')
      }
      
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          amount,
          currency,
          tier
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        throw new Error('No authorization URL received from payment provider')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          You are about to purchase {plan.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        
        <div className="space-y-2">
          <Label>Plan</Label>
          <Input value={plan.name} disabled />
        </div>
        
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input 
            value={
              plan.price && !isNaN(plan.price)
                ? formatCurrency(plan.price, currencyProp)
                : 'Loading...'
            } 
            disabled 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Description</Label>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </CardContent>
    </Card>
  )
}