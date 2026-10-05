/**
 * Environment Variable Validation
 * Checks required environment variables at build time and runtime
 * Prevents deployment with missing critical configuration
 */

const requiredEnvVars = {
  // Database (Required)
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL from Dashboard > Settings > API',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anon/public key from Dashboard > Settings > API',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key from Dashboard > Settings > API',
  DATABASE_URL: 'Supabase connection string from Dashboard > Settings > Database > Connection String (use pooler)',
  
  // Authentication (Required)
  BETTER_AUTH_SECRET: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  CSRF_SECRET: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  
  // Application (Required)
  NEXT_PUBLIC_APP_URL: 'Your application URL (e.g., https://yourdomain.com)',
  BETTER_AUTH_URL: 'Same as NEXT_PUBLIC_APP_URL',
} as const

const optionalEnvVars = {
  // Payments
  PAYSTACK_SECRET_KEY: 'Paystack secret key for payment processing',
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: 'Paystack public key for client-side',
  PAYSTACK_WEBHOOK_SECRET: 'Paystack webhook verification secret',
  
  // Email
  RESEND_API_KEY: 'Resend API key for sending emails',
  RESEND_FROM_EMAIL: 'Email address to send from (must be verified domain)',
  
  // Rate Limiting
  UPSTASH_REDIS_REST_URL: 'Upstash Redis URL (optional, uses in-memory fallback)',
  UPSTASH_REDIS_REST_TOKEN: 'Upstash Redis token',
  
  // OAuth (Optional)
  GOOGLE_CLIENT_ID: 'Google OAuth client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret',
  GITHUB_CLIENT_ID: 'GitHub OAuth client ID',
  GITHUB_CLIENT_SECRET: 'GitHub OAuth client secret',
} as const

export function checkRequiredEnvVars(): { missing: string[], warnings: string[] } {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(`❌ ${key}: ${description}`)
    }
  }
  
  // Check optional but recommended variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`⚠️  ${key}: ${description}`)
    }
  }
  
  return { missing, warnings }
}

export function validateEnvOrExit() {
  const { missing, warnings } = checkRequiredEnvVars()
  
  if (missing.length > 0) {
    console.error('\n🚨 MISSING REQUIRED ENVIRONMENT VARIABLES:\n')
    missing.forEach(msg => console.error(msg))
    console.error('\n📖 Set these in Vercel Dashboard > Settings > Environment Variables')
    console.error('📖 Or in your .env.local file for local development\n')
    process.exit(1)
  }
  
  if (warnings.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️  MISSING OPTIONAL ENVIRONMENT VARIABLES:\n')
    warnings.forEach(msg => console.warn(msg))
    console.warn('\n📖 These are optional but recommended for full functionality\n')
  }
  
  console.log('✅ All required environment variables are set\n')
}

// Run validation during build
if (process.env.NODE_ENV !== 'test') {
  validateEnvOrExit()
}
