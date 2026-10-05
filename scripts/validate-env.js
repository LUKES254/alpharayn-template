#!/usr/bin/env node

/**
 * Pre-build validation script
 * Validates all required environment variables before build starts
 * This prevents wasted build time on Vercel if env vars are missing
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'CSRF_SECRET',
]

const optionalEnvVars = [
  'BETTER_AUTH_URL',
  'PAYSTACK_SECRET_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
]

function validateEnvVars() {
  console.log('🔍 Validating environment variables...\n')
  
  const missing = []
  const warnings = []
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName] || process.env[varName] === '') {
      missing.push(varName)
    } else {
      console.log(`✅ ${varName}`)
    }
  }
  
  // Check optional variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName] || process.env[varName] === '') {
      warnings.push(varName)
    }
  }
  
  // Report results
  console.log('')
  
  if (missing.length > 0) {
    console.error('❌ DEPLOYMENT FAILED: Missing required environment variables:\n')
    missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\n📖 Set these in: Vercel Dashboard > Settings > Environment Variables')
    console.error('📖 See key-files/DEPLOYMENT.md for detailed instructions\n')
    process.exit(1)
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:')
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`)
    })
    console.warn('\n📖 These are optional but recommended for full functionality')
    console.warn('📖 See key-files/DEPLOYMENT.md for details\n')
  }
  
  console.log('✅ All required environment variables are set!')
  console.log('🚀 Proceeding with build...\n')
}

// Run validation
try {
  validateEnvVars()
} catch (error) {
  console.error('❌ Environment validation failed:', error.message)
  process.exit(1)
}
