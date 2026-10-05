export const emailTemplates = {
  welcome: (name: string, loginUrl: string) => ({
    subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for joining us! We're excited to have you as part of our community.</p>
              <p>Your account has been successfully created. You can now access all features of our platform.</p>
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Get Started</a>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The ${process.env.NEXT_PUBLIC_APP_NAME} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!

Hello ${name},

Thank you for joining us! We're excited to have you as part of our community.

Your account has been successfully created. You can now access all features of our platform.

Get started: ${loginUrl}

If you have any questions, feel free to reach out to our support team.

Best regards,
The ${process.env.NEXT_PUBLIC_APP_NAME} Team`
  }),

  paymentConfirmation: (
    name: string,
    amount: number,
    currency: string,
    reference: string,
    date: string
  ) => ({
    subject: `Payment Confirmation - ${reference}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Great news! Your payment has been successfully processed.</p>
              
              <div class="details">
                <h3>Payment Details</h3>
                <div class="detail-row">
                  <strong>Amount:</strong>
                  <span>${amount} ${currency}</span>
                </div>
                <div class="detail-row">
                  <strong>Reference:</strong>
                  <span>${reference}</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${date}</span>
                </div>
                <div class="detail-row">
                  <strong>Status:</strong>
                  <span style="color: #28a745; font-weight: bold;">Successful</span>
                </div>
              </div>
              
              <p>Thank you for your payment. You can now access the services you've purchased.</p>
              <p>If you have any questions about this payment, please contact our support team.</p>
              <p>Best regards,<br>The ${process.env.NEXT_PUBLIC_APP_NAME} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Payment Confirmation - ${reference}

Hello ${name},

Great news! Your payment has been successfully processed.

Payment Details:
- Amount: ${amount} ${currency}
- Reference: ${reference}
- Date: ${date}
- Status: Successful

Thank you for your payment. You can now access the services you've purchased.

If you have any questions about this payment, please contact our support team.

Best regards,
The ${process.env.NEXT_PUBLIC_APP_NAME} Team`
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your ${process.env.NEXT_PUBLIC_APP_NAME} account.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
              
              <p>Best regards,<br>The ${process.env.NEXT_PUBLIC_APP_NAME} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Password Reset Request

Hello ${name},

We received a request to reset your password for your ${process.env.NEXT_PUBLIC_APP_NAME} account.

Reset your password: ${resetUrl}

Important: This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.

Best regards,
The ${process.env.NEXT_PUBLIC_APP_NAME} Team`
  }),

  magicLink: (email: string, url: string, appName: string) => ({
    subject: `Sign in to ${appName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign In</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            .link-box { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; word-break: break-all; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 ${appName}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Magic Link Sign In</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
              <p>Hello!</p>
              <p>Click the button below to securely sign in to your account. This link will expire in <strong>5 minutes</strong> for your security.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" class="button">Sign In Now</a>
              </div>
              
              <p style="color: #666; font-size: 13px; margin-bottom: 5px;">Or copy and paste this link into your browser:</p>
              <div class="link-box">
                <span style="color: #667eea; font-size: 12px;">${url}</span>
              </div>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>⚠️ Security Notice:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 13px;">If you didn't request this email, you can safely ignore it. This link will expire in 5 minutes.</p>
              </div>
              
              <p style="margin-top: 25px;">Best regards,<br>The ${appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
              <p>Sent to ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Sign in to ${appName}

Hello!

Click the link below to sign in to your account:
${url}

This link will expire in 5 minutes for your security.

If you didn't request this email, you can safely ignore it.

Best regards,
The ${appName} Team

Sent to ${email}`
  })
}