import { z } from 'zod'

// Environment variable validation schema
export const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(50, 'SUPABASE_SERVICE_ROLE_KEY required'),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('Invalid BETTER_AUTH_URL'),
  
  // Payment
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_', 'Invalid PAYSTACK_SECRET_KEY format'),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith('pk_', 'Invalid PAYSTACK_PUBLIC_KEY format'),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1, 'PAYSTACK_WEBHOOK_SECRET required'),
  
  // Email
  RESEND_API_KEY: z.string().startsWith('re_', 'Invalid RESEND_API_KEY format').optional(),
  
  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Admin
  ADMIN_EMAILS: z.string().optional(),
  ADMIN_IPS: z.string().optional(),
  
  // Rate limiting (optional - will use default if not set)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // CSRF Secret
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validate and export environment variables
export function validateEnv() {
  try {
    return EnvSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:')
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      throw new Error('Invalid environment variables')
    }
    throw error
  }
}

// Type-safe environment variables
export type ValidatedEnv = z.infer<typeof EnvSchema>
