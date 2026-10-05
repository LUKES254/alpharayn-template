'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

interface PaymentPageInfo {
  amount: number
  currency: string
  name: string
}

export function PricingCard() {
  const [pageInfo, setPageInfo] = useState<PaymentPageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  const fetchPaymentPageInfo = async () => {
    try {
      const response = await fetch('/api/payments/page-info')
      if (response.ok) {
        const data = await response.json()
        console.log('Payment page data:', data) // Debug log
        setPageInfo({
          amount: data.amount,
          currency: data.currency,
          name: data.name || 'Complete Bundle'
        })
        // Cache the data in localStorage for instant display on next visit
        localStorage.setItem('pricing-cache', JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          name: data.name,
          timestamp: Date.now()
        }))
      } else {
        console.error('Failed to fetch payment info:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Failed to fetch payment info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try to load from cache first for instant display
    try {
      const cached = localStorage.getItem('pricing-cache')
      if (cached) {
        const cachedData = JSON.parse(cached)
        // Use cache if less than 1 hour old
        if (Date.now() - cachedData.timestamp < 3600000) {
          setPageInfo({
            amount: cachedData.amount,
            currency: cachedData.currency,
            name: cachedData.name
          })
          setLoading(false)
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    
    // Always fetch fresh data in background
    fetchPaymentPageInfo()
  }, [])

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      // Fetch the payment URL from the server (secure, no hardcoded values)
      const response = await fetch('/api/payments/page-info')
      if (!response.ok) {
        throw new Error('Failed to fetch payment information')
      }
      const data = await response.json()
      
      // Redirect directly to Paystack payment page
      // The slug is fetched securely from the server
      const pageSlug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-')
      if (!pageSlug) {
        throw new Error('Payment page not configured')
      }
      
      window.location.href = `https://paystack.com/pay/${pageSlug}`
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
      setPurchasing(false)
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    const majorUnits = (amount / 100).toFixed(2)
    const symbol = currency === 'NGN' ? '₦' : currency === 'KES' ? 'KSh' : '$'
    return `${symbol}${majorUnits}`
  }

  const features = [
    "Next.js 14 + TypeScript",
    "Paystack Integration (Cards + Mobile Money)",
    "BetterAuth Authentication",
    "Supabase Database + RLS",
    "Resend Email System",
    "Admin Dashboard",
    "Lifetime Updates",
    "Discord Community Access"
  ]

  return (
    <div className="max-w-md mx-auto">
      <Card className="border border-gray-200 dark:border-gray-800 relative overflow-hidden shadow-lg rounded-3xl bg-white dark:bg-gray-900">
        <CardContent className="p-8">
          {/* Title */}
          <h3 className="text-xl font-semibold text-primary mb-6">
            {loading ? 'Complete Bundle' : pageInfo?.name || 'Complete Bundle'}
          </h3>

          {/* Price Section */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-baseline gap-3 animate-pulse">
                <span className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></span>
                <span className="h-10 w-40 bg-gray-300 dark:bg-gray-600 rounded"></span>
              </div>
            ) : pageInfo ? (
              <div className="flex items-baseline gap-3">
                <span className="text-gray-400 line-through text-lg font-normal">
                  {formatPrice(Math.round(pageInfo.amount * 1.3), pageInfo.currency)}
                </span>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(pageInfo.amount, pageInfo.currency)}
                </span>
              </div>
            ) : (
              <div className="text-sm text-red-500">
                Failed to load pricing. Please refresh.
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <svg 
                  className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full h-12 text-base font-semibold bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all"
            onClick={handlePurchase}
            disabled={loading || purchasing}
          >
            {purchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Buy now'
            )}
          </Button>

          {/* Bottom Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Pay once, launch unlimited products
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
