import { NextRequest, NextResponse } from 'next/server'
import { fetchPaystackPlans, mergePlansWithFallback, FALLBACK_PLANS } from '@/lib/plans'

export async function GET(request: NextRequest) {
  try {
    const paystackPlans = await fetchPaystackPlans()
    const mergedPlans = mergePlansWithFallback(paystackPlans)
    
    return NextResponse.json({
      success: true,
      debug: {
        paystackPlansRaw: paystackPlans,
        paystackPlansCount: paystackPlans?.length || 0,
        fallbackPlans: FALLBACK_PLANS,
        mergedPlans: mergedPlans,
        usingFallback: !paystackPlans || paystackPlans.length === 0,
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
