'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { getCSRFToken } from '@/lib/csrf-client'
import { formatCurrency } from '@/lib/utils'

interface OneTimeProduct {
  id: string
  name: string
  description: string | null
  slug: string
  amount: number
  currency: string
  category: string | null
  features: string[] | null
  icon: string | null
  is_active: boolean
  display_order: number
}

interface OneTimeProductsProps {
  products: OneTimeProduct[]
  currency: string
}

export function OneTimeProducts({ products, currency }: OneTimeProductsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async (product: OneTimeProduct) => {
    setLoading(true)
    setError(null)

    try {
      const csrfToken = await getCSRFToken()
      if (!csrfToken) {
        throw new Error('Unable to get CSRF token. Please refresh and try again.')
      }

      const response = await fetch('/api/payments/one-time', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          amount: product.amount,
          productId: product.id,
          currency: product.currency
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
        throw new Error('No authorization URL received')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">One-Time Purchases</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Buy individual products or add-ons
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const priceMinorUnits = product.amount
          const priceMajorUnits = priceMinorUnits / 100

          return (
            <Card key={product.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.category && (
                      <CardDescription className="text-xs mt-1 uppercase tracking-wider">
                        {product.category}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}

                {product.features && product.features.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t pt-4 space-y-3">
                  <div className="text-3xl font-bold">
                    {formatCurrency(priceMajorUnits, currency)}
                  </div>

                  <Button
                    onClick={() => handlePurchase(product)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : 'Buy Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

