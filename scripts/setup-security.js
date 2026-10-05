#!/usr/bin/env node

/**
 * First-run setup helper.
 * Creates .env.local from .env.example (if missing) and fills in securely
 * generated BETTER_AUTH_SECRET and CSRF_SECRET values.
 *
 * Usage:
 *   npm run setup:secrets
 *   node scripts/setup-security.js
 *   node scripts/setup-security.js --force   # regenerate secrets even if set
 *
 * Safe to run more than once: existing real secrets are kept unless --force.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.resolve(__dirname, '..')
const EXAMPLE_PATH = path.join(ROOT, '.env.example')
const TARGET_PATH = path.join(ROOT, '.env.local')
const SECRET_KEYS = ['BETTER_AUTH_SECRET', 'CSRF_SECRET']
const FORCE = process.argv.includes('--force')

function generateSecret() {
  return crypto.randomBytes(32).toString('hex')
}

function isPlaceholder(value) {
  const raw = String(value || '').trim().replace(/^["']|["']$/g, '')
  if (raw === '') return true
  return (
    raw.includes('your-generated') ||
    raw.includes('generate-with-crypto') ||
    raw.startsWith('your-') ||
    raw.startsWith('changeme')
  )
}

function getValue(content, key) {
  const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1] : null
}

function setValue(content, key, value) {
  const line = `${key}="${value}"`
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (regex.test(content)) return content.replace(regex, line)
  return content.replace(/\s*$/, `\n${line}\n`)
}

function main() {
  if (!fs.existsSync(EXAMPLE_PATH)) {
    console.error('❌ Missing .env.example — cannot create .env.local')
    process.exit(1)
  }

  const existedBefore = fs.existsSync(TARGET_PATH)
  let content = fs.readFileSync(existedBefore ? TARGET_PATH : EXAMPLE_PATH, 'utf8')

  console.log(existedBefore ? '📄 Using existing .env.local' : '📄 Creating .env.local from .env.example')
  console.log('')

  for (const key of SECRET_KEYS) {
    const current = getValue(content, key)
    if (!FORCE && !isPlaceholder(current)) {
      console.log(`   • Kept existing ${key}`)
      continue
    }
    content = setValue(content, key, generateSecret())
    console.log(`   • ${FORCE ? 'Regenerated' : 'Generated'} ${key}`)
  }

  fs.writeFileSync(TARGET_PATH, content)

  console.log('')
  console.log('✅ .env.local is ready.')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Edit .env.local and add your Supabase credentials:')
  console.log('     DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,')
  console.log('     NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
  console.log('  2. Run supabase/main.sql in the Supabase SQL Editor')
  console.log('  3. Start the app: npm run dev')
  console.log('')
  console.log('📖 Full guide: key-files/DOCUMENTATION.md')
}

try {
  main()
} catch (error) {
  console.error('❌ Setup failed:', error.message)
  process.exit(1)
}
