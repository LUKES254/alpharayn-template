import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const currency = request.nextUrl.searchParams.get('currency') || 'KES'

    // Fetch active one-time products for the specified currency
    const { data: products, error } = await supabaseAdmin
      .from('one_time_products')
      .select('*')
      .eq('is_active', true)
      .eq('currency', currency.toUpperCase())
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching one-time products:', error)
      throw new APIError(
        500,
        ErrorCodes.DATABASE_ERROR,
        'Failed to fetch products'
      )
    }

    return NextResponse.json({
      success: true,
      data: products || [],
      correlationId
    })

  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/payments/products',
      method: 'GET'
    })
  }
}
