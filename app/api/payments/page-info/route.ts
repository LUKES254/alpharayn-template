import { NextResponse } from 'next/server'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'

export async function GET() {
  const correlationId = generateCorrelationId()
  
  try {
    const pageSlug = process.env.PAYSTACK_PAYMENT_PAGE_SLUG

    if (!pageSlug) {
      throw new APIError(
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Payment page not configured'
      )
    }

    // Fetch payment page details from Paystack
    const response = await fetch(`https://api.paystack.co/page/${pageSlug}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Paystack API error:', { status: response.status, body: errorText })
      throw new APIError(
        response.status,
        ErrorCodes.PAYMENT_GATEWAY_ERROR,
        `Failed to fetch payment page: ${response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.data.amount) {
      throw new APIError(
        500,
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Payment page does not have a fixed amount configured'
      )
    }

    return NextResponse.json({
      success: true,
      amount: data.data.amount,
      currency: data.data.currency,
      name: data.data.name,
      description: data.data.description,
      slug: pageSlug, // Return slug securely from server
      correlationId,
    })

  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/payments/page-info',
      method: 'GET'
    })
  }
}
