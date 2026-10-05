import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailTemplate {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
}: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: html || '',
      text: text || '',
    })

    if (error) {
      console.error('Email sending error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}