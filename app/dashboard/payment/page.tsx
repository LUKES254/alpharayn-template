import { getSession, ensureAdminPremium } from '@/lib/auth-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { FALLBACK_PLANS, type Tier, fetchPaystackPlans, mergePlansWithFallback } from '@/lib/plans'
import { PaymentForm } from '@/components/payments/payment-form'
import { OneTimeProducts } from '@/components/payments/one-time-products'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'

// Disable caching for this page to always show fresh subscription data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  // Toggle between subscriptions and one-time products
  const showSubscriptions = true
  const showOneTime = false

  const session = await getSession()
  // Ensure admins are premium
  await ensureAdminPremium(session.user.id, session.user.email)
  
  // Subscription data (only fetched if needed)
  let PLANS = FALLBACK_PLANS
  let usingFallback = true
  let currentTier: Tier = 'free'
  let upgradeOptions: Tier[] = []
  let downgradeOptions: Tier[] = []

  if (showSubscriptions) {
    const paystackPlans = await fetchPaystackPlans()
    PLANS = mergePlansWithFallback(paystackPlans)
    usingFallback = !paystackPlans || paystackPlans.length === 0

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user subscription:', error)
    }

    console.log('Payment page - User subscription:', {
      userId: session.user.id,
      subscriptionTier: user?.subscription_tier,
      usingFallbackPlans: usingFallback,
      paystackPlansCount: paystackPlans?.length || 0,
      timestamp: new Date().toISOString()
    })

    currentTier = (user?.subscription_tier || 'free') as Tier

    const allTiers: Tier[] = ['free', 'pro', 'premium']
    const currentTierIndex = allTiers.indexOf(currentTier)
    upgradeOptions = allTiers.filter((_, index) => index > currentTierIndex)
    downgradeOptions = allTiers.filter((_, index) => index < currentTierIndex)
  }
  
  // Get currency from environment (KES or NGN)
  const currency = (process.env.NEXT_PUBLIC_CURRENCY || 'KES').toUpperCase() as 'NGN' | 'KES'

  // Fetch one-time products
  const productsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/products?currency=${currency}`,
    { 
      cache: 'no-store'
    }
  )
  const productsData = await productsResponse.json()
  const oneTimeProducts = productsData.success ? productsData.data : []

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Manage Subscription</h1>
          <p className="text-muted-foreground">
            Current plan: <strong className="uppercase">{currentTier}</strong>
          </p>
        </div>
      </div>

      {/* Success Message */}
      {searchParams.success === 'downgraded' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-green-800 font-medium">
              ✓ Your subscription has been updated successfully!
            </p>
          </CardContent>
        </Card>
      )}

      {showSubscriptions && usingFallback && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            ⚠️ Unable to fetch plans from Paystack. Showing default pricing. Please refresh the page or contact support if this persists.
          </AlertDescription>
        </Alert>
      )}

      {showSubscriptions && upgradeOptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upgrade Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upgradeOptions.map((tier) => {
              const planMeta = PLANS[tier]
              const priceMinorUnits = planMeta.prices[currency] || 0
              const priceMajorUnits = priceMinorUnits / 100
              
              const plan = {
                id: tier,
                name: planMeta.label,
                price: priceMajorUnits,
                description: planMeta.features.join(' • '),
                amountMinorUnits: priceMinorUnits,
              }
              return (
                <Card key={tier} className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded">
                        Upgrade
                      </span>
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      {formatCurrency(priceMajorUnits, currency)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </div>
                    <PaymentForm plan={{ ...plan }} currency={currency} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {showSubscriptions && downgradeOptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Downgrade or Cancel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {downgradeOptions.map((tier) => {
              const planMeta = PLANS[tier]
              const priceMinorUnits = planMeta.prices[currency] || 0
              const priceMajorUnits = priceMinorUnits / 100
              
              return (
                <Card key={tier} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {planMeta.label}
                      {tier === 'free' && (
                        <span className="text-sm font-normal text-red-600 bg-red-50 px-2 py-1 rounded">
                          Cancel
                        </span>
                      )}
                      {tier !== 'free' && (
                        <span className="text-sm font-normal text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Downgrade
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{planMeta.features.join(' • ')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      {priceMajorUnits === 0 ? (
                        'Free'
                      ) : (
                        <>
                          {formatCurrency(priceMajorUnits, currency)}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </>
                      )}
                    </div>
                    <form action={`/api/user/subscription/downgrade`} method="POST">
                      <input type="hidden" name="targetTier" value={tier} />
                      <Button 
                        type="submit" 
                        variant={tier === 'free' ? 'destructive' : 'outline'}
                        className="w-full"
                      >
                        {tier === 'free' ? 'Cancel Subscription' : `Downgrade to ${planMeta.label}`}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {showSubscriptions && currentTier !== 'free' && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Downgrades will take effect at the end of your current billing period</p>
            <p>• You will retain access to {PLANS[currentTier].label} features until then</p>
            <p>• Cancelling will move you to the Free plan</p>
            <p>• You can upgrade again at any time</p>
          </CardContent>
        </Card>
      )}

      {/* One-Time Products */}
      {oneTimeProducts && oneTimeProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <OneTimeProducts 
            products={oneTimeProducts}
            currency={currency}
          />
        </div>
      )}
    </div>
  )
}
