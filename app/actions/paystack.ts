'use server'

import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from '@/lib/email'

export async function initializeOneTimePayment(email: string) {
  const pageSlug = process.env.PAYSTACK_PAYMENT_PAGE_SLUG

  if (!pageSlug) {
      throw new Error('PAYSTACK_PAYMENT_PAGE_SLUG is not configured')
  }

  // 1. Fetch Page Details to get the Amount
  let amount: string
  let currency: string
  
  try {
      const pageResponse = await fetch(`https://api.paystack.co/page/${pageSlug}`, {
          method: 'GET',
          headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
      })
      
      const pageData = await pageResponse.json()
      
      if (!pageResponse.ok) {
          throw new Error(pageData.message || 'Failed to fetch payment page details')
      }

      // Ensure the page has a fixed amount
      if (!pageData.data.amount) {
          throw new Error('The configured Paystack Page does not have a fixed amount')
      }

      amount = pageData.data.amount.toString()
      currency = pageData.data.currency
  } catch (error) {
      console.error('Error fetching Paystack page details:', error)
      throw error
  }

  // 2. Initialize Transaction with the fetched amount
  const params = {
    email,
    amount,
    currency,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you`,
    metadata: {
      product: pageSlug, // Use slug as product identifier
      payment_type: "one_time",
      cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    },
    channels: ['card', 'mobile_money']
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment')
    }

    return { authorization_url: data.data.authorization_url }
  } catch (error) {
    console.error('Paystack initialization error:', error)
    throw error
  }
}

export async function verifyOneTimePayment(reference: string) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      throw new Error(data.message || 'Verification failed')
    }

    const { status, customer, metadata, amount } = data.data

    if (status !== 'success') {
      return { success: false, message: 'Payment was not successful' }
    }

    // Optional: Verify amount and product
    // Note: We allow matching metadata to ensure it's our product
    const expectedProduct = process.env.PAYSTACK_PAYMENT_PAGE_SLUG
    if (expectedProduct && metadata?.product !== expectedProduct) {
        // Log this but maybe don't fail the user if they paid money? 
        // For now, let's treat it as valid but log it.
        console.warn('Metadata product mismatch:', metadata)
    }

    // Format amount (Paystack returns amount in kobo/cents, so divide by 100)
    const formattedAmount = `$${(amount / 100).toFixed(2)}`

    // Send confirmation email
    await sendEmail({
      to: customer.email,
      subject: 'Welcome to ideacloner - Next Steps',
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>We have successfully received your payment of ${formattedAmount}.</p>
        <p><strong>Important:</strong> To get access to the GitHub repository, please reply to this email with your <strong>GitHub username</strong>.</p>
        <p>We will add you to the repository within 24 hours.</p>
        <br>
        <p>Best regards,<br>The ideacloner Team</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Payment verification error:', error)
    return { success: false, message: 'Failed to verify payment' }
  }
}
