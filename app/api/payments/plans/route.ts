import { NextRequest, NextResponse } from 'next/server'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'

// Simple in-memory cache for plans
let plansCache: {
  data: any[] | null
  timestamp: number
} = {
  data: null,
  timestamp: 0
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface PaystackPlan {
  id: number
  name: string
  plan_code: string
  description: string | null
  amount: number
  interval: string
  currency: string
  send_invoices: boolean
  send_sms: boolean
  hosted_page: boolean
  hosted_page_url: string | null
  hosted_page_summary: string | null
  integration: number
  domain: string
  createdAt: string
  updatedAt: string
}

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const force = request.nextUrl.searchParams.get('force') === '1' || request.nextUrl.searchParams.get('fresh') === '1'

    // Check if we have cached data
    const now = Date.now()
    if (!force && plansCache.data && (now - plansCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: plansCache.data,
        cached: true,
        correlationId
      })
    }

    // Fetch plans from Paystack
    const response = await fetch('https://api.paystack.co/plan', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (!result.status) {
      throw new APIError(
        502,
        ErrorCodes.PAYMENT_GATEWAY_ERROR,
        result.message || 'Failed to fetch plans from Paystack'
      )
    }

    // Transform Paystack plans to our format
    const plans = result.data.map((plan: PaystackPlan) => {
      // Extract tier from plan name or code (e.g., "Pro Plan" -> "pro", "PREMIUM" -> "premium")
      const tierMatch = plan.name.toLowerCase().match(/\b(free|pro|premium)\b/) || 
                       plan.plan_code.toLowerCase().match(/\b(free|pro|premium)\b/)
      
      const tier = tierMatch ? tierMatch[0] : 'unknown'
      
      // Generate proper label if plan name is just the tier
      let label = plan.name
      if (label.toLowerCase() === tier) {
        // Capitalize: "pro" -> "Pro Plan"
        label = tier.charAt(0).toUpperCase() + tier.slice(1) + ' Plan'
      }
      
      return {
        id: tier,
        paystackPlanCode: plan.plan_code,
        paystackId: plan.id,
        label: label,
        description: plan.description || '',
        amount: plan.amount, // Amount in minor units (kobo/cents)
        currency: plan.currency,
        interval: plan.interval,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }
    })

    // Update cache
    plansCache = {
      data: plans,
      timestamp: now
    }

    return NextResponse.json({
      success: true,
      data: plans,
      cached: false,
      correlationId
    })

  } catch (error) {
    return handleAPIError(error, correlationId, { 
      route: '/api/payments/plans', 
      method: 'GET' 
    })
  }
}

// Force refresh plans (no CSRF required for GET-like operations)
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const body = await request.json().catch(() => ({ action: 'refresh' }))
    
    if (body.action === 'refresh') {
      // Clear cache
      plansCache = {
        data: null,
        timestamp: 0
      }

      return NextResponse.json({
        success: true,
        message: 'Plans cache cleared. Next request will fetch fresh data.',
        correlationId
      })
    }

    throw new APIError(
      400,
      ErrorCodes.INVALID_INPUT,
      'Invalid action. Use { "action": "refresh" } to clear cache.'
    )
  } catch (error) {
    return handleAPIError(error, correlationId, { 
      route: '/api/payments/plans', 
      method: 'POST' 
    })
  }
}
