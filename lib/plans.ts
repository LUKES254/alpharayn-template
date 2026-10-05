export type Tier = 'free' | 'pro' | 'premium'

interface PlanMeta {
  id: Tier
  label: string
  baseCurrency: string
  features: string[]
  prices: Record<string, number> // currency => minor units (e.g. NGN kobo, KES cents)
  paystackPlanCode?: string // Plan code from Paystack dashboard
}

// FALLBACK PLANS - Used when Paystack API is unavailable
export const FALLBACK_PLANS: Record<Tier, PlanMeta> = {
  free: {
    id: 'free',
    label: 'Free',
    baseCurrency: 'NGN',
    features: ['Basic features'],
    prices: {
      NGN: 0,
      KES: 0,
    },
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    baseCurrency: 'NGN',
    features: ['Everything in Free', 'Pro features'],
    prices: {
      NGN: 5000_00, // ₦5,000.00
      KES: 9500_00, // KSh 9,500.00
    },
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    baseCurrency: 'NGN',
    features: ['Everything in Pro', 'Premium features'],
    prices: {
      NGN: 15000_00, // ₦15,000.00
      KES: 28500_00, // KSh 28,500.00
    },
  },
}

// Export PLANS for backward compatibility (uses fallback by default)
export const PLANS = FALLBACK_PLANS

// Dynamic plan structure from Paystack
export interface PaystackPlan {
  id: Tier
  paystackPlanCode: string
  paystackId: number
  label: string
  description: string
  amount: number
  currency: string
  interval: string
  createdAt: string
  updatedAt: string
}

/**
 * Fetch plans from Paystack API
 * @returns Array of Paystack plans or null if fetch fails
 */
export async function fetchPaystackPlans(): Promise<PaystackPlan[] | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/plans`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      console.error('Failed to fetch Paystack plans:', response.statusText)
      return null
    }
    
    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching Paystack plans:', error)
    return null
  }
}

/**
 * Get plan amount from dynamic or fallback plans
 * @param tier - Subscription tier
 * @param currency - Currency code
 * @param paystackPlans - Optional array of Paystack plans
 * @returns Amount in minor units or null
 */
export function getPlanAmountMinorUnits(
  tier: Tier, 
  currency: string,
  paystackPlans?: PaystackPlan[] | null
): number | null {
  // Try to get from Paystack plans first
  if (paystackPlans && paystackPlans.length > 0) {
    const paystackPlan = paystackPlans.find(
      p => p.id === tier && p.currency.toUpperCase() === currency.toUpperCase()
    )
    if (paystackPlan) {
      return paystackPlan.amount
    }
  }
  
  // Fallback to static plans
  const plan = FALLBACK_PLANS[tier]
  if (!plan) return null
  return plan.prices[currency] ?? null
}

/**
 * Merge Paystack plans with fallback plans
 * Groups Paystack plans by tier and consolidates pricing across currencies
 */
export function mergePlansWithFallback(paystackPlans: PaystackPlan[] | null): Record<Tier, PlanMeta> {
  if (!paystackPlans || paystackPlans.length === 0) {
    return FALLBACK_PLANS
  }

  const merged: Record<Tier, PlanMeta> = { ...FALLBACK_PLANS }

  // Group Paystack plans by tier
  const tierGroups = paystackPlans.reduce((acc, plan) => {
    if (!acc[plan.id]) acc[plan.id] = []
    acc[plan.id].push(plan)
    return acc
  }, {} as Record<string, PaystackPlan[]>)

  // Update each tier with Paystack data
  Object.keys(tierGroups).forEach(tierId => {
    const tier = tierId as Tier
    const tierPlans = tierGroups[tier]
    
    if (tierPlans.length > 0) {
      // Sort by amount (highest first), then by updatedAt (most recent first)
      const sortedPlans = tierPlans.sort((a, b) => {
        if (b.amount !== a.amount) return b.amount - a.amount // Highest price first
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA // Most recent first if same price
      })
      
      const primaryPlan = sortedPlans[0]
      const prices: Record<string, number> = {}
      
      // Collect prices for all currencies (use highest price for duplicates)
      const currencyMap = new Map<string, PaystackPlan>()
      tierPlans.forEach(plan => {
        const curr = plan.currency.toUpperCase()
        const existing = currencyMap.get(curr)
        // Use plan with highest amount for each currency
        if (!existing || plan.amount > existing.amount) {
          currencyMap.set(curr, plan)
        }
      })
      
      // Convert map to prices object
      currencyMap.forEach((plan, currency) => {
        prices[currency] = plan.amount
      })

      merged[tier] = {
        id: tier,
        label: primaryPlan.label,
        baseCurrency: primaryPlan.currency.toUpperCase(),
        features: primaryPlan.description ? [primaryPlan.description] : merged[tier].features,
        prices,
        paystackPlanCode: primaryPlan.paystackPlanCode,
      }
    }
  })

  return merged
}
