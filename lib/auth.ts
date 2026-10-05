import { betterAuth } from "better-auth"
import { drizzle } from "drizzle-orm/postgres-js"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import postgres from "postgres"
import * as schema from "./auth-schema"
import { Resend } from "resend"
import { PasswordSchema } from "./validation/user-schema"
import { magicLink } from "better-auth/plugins"

// Supabase provides an HTTP/REST endpoint for database access
// This works without requiring IPv4 direct database connection
// Format: postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn(
    "⚠️  DATABASE_URL is not set. Using Supabase REST API fallback.\n" +
    "For production, set DATABASE_URL from: Supabase Dashboard > Settings > Database > Connection String"
  )
}

// Use postgres.js with connection pooling (works over HTTP/REST)
const client = postgres(connectionString || "", {
  max: 10, // Increased pool size to handle concurrent requests
  prepare: false, // Required for Supabase pooler
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 30, // Increased connection timeout to 30 seconds
  max_lifetime: 60 * 30, // 30 minutes
  connection: {
    application_name: 'nextjs-saas-app',
  },
})

const db = drizzle(client)

// Initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Validate critical auth environment variables in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET === 'generate-with-crypto-randomBytes-32-chars-minimum') {
    throw new Error('BETTER_AUTH_SECRET is required in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
  }
  if (!process.env.BETTER_AUTH_URL && !process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is required in production')
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema, // Pass the schema explicitly
  }),
  secret: process.env.BETTER_AUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-do-not-use-in-production'),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  emailAndPassword: {
    enabled: true,
    // Enforce strong password requirements
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Custom password validation using Zod schema
    async validatePassword(password: string) {
      const result = PasswordSchema.safeParse(password)
      if (!result.success) {
        const errors = result.error.issues.map(e => e.message).join(', ')
        throw new Error(errors)
      }
      return true
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!process.env.GITHUB_CLIENT_ID,
    }
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        console.log('[DEBUG] sendMagicLink called')
        console.log('[DEBUG] Email:', email)
        console.log('[DEBUG] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY)
        
        if (resend) {
          // Production: Send real email via Resend
          try {
            console.log('[DEBUG] Sending magic link email via Resend')
            const result = await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: email,
              subject: `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Platform'}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Platform'}</h1>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h2 style="color: white; margin: 0 0 10px 0;">🔐 Magic Link Sign In</h2>
                    <p style="color: white; margin: 0; opacity: 0.9;">Click the button below to securely sign in to your account.</p>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
                    <p style="color: #333; line-height: 1.6; margin-top: 0;">
                      Click the button below to sign in. This link will expire in <strong>5 minutes</strong> for your security.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${url}" 
                         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                        Sign In Now
                      </a>
                    </div>
                    
                    <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; color: #667eea; font-size: 12px; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e0e0e0;">${url}</p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      If you didn't request this email, you can safely ignore it.
                    </p>
                    <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                      This link will expire in 5 minutes.
                    </p>
                  </div>
                </div>
              `,
            })
            console.log('[DEBUG] Magic link email sent successfully:', result)
            if (result && result.error) {
              console.error('[DEBUG] Resend error:', result.error)
            }
            console.log('✅ Magic link email sent to:', email)
          } catch (error) {
            console.error('❌ Failed to send magic link email:', error)
            throw error
          }
        } else {
          // Development fallback: Log to console
          console.log('\n========================================')
          console.log('🔗 MAGIC LINK SIGN IN')
          console.log('========================================')
          console.log('Email:', email)
          console.log('Token:', token)
          console.log('\n🔗 Magic Link URL:')
          console.log(url)
          console.log('========================================\n')
        }
      },
      expiresIn: 300, // 5 minutes
      disableSignUp: false, // Allow new user registration via magic link
    })
  ],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      console.log('[DEBUG] sendVerificationEmail called')
      console.log('[DEBUG] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY)
      console.log('[DEBUG] RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
      if (resend) {
        // Production: Send real email via Resend
        try {
          console.log('[DEBUG] About to call resend.emails.send')
          const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: user.email,
            subject: `Verify your email - ${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Platform'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Platform'}!</h2>
                <p>Hi ${user.name},</p>
                <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
                <div style="margin: 30px 0;">
                  <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: 600;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #0070f3; word-break: break-all; font-size: 12px;">${url}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #999; font-size: 12px;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
              </div>
            `,
          })
          console.log('[DEBUG] resend.emails.send result:', result)
          if (result && result.error) {
            console.error('[DEBUG] Resend error:', result.error)
          }
          console.log('✅ Verification email sent to:', user.email)
        } catch (error) {
          console.error('❌ Failed to send verification email:', error)
          throw error
        }
      } else {
        // Development fallback: Log to console
        console.log('\n========================================')
        console.log('📧 EMAIL VERIFICATION REQUIRED')
        console.log('========================================')
        console.log('User:', user.email)
        console.log('Name:', user.name)
        console.log('\n🔗 Verification URL:')
        console.log(url)
        console.log('========================================\n')
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})