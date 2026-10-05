/**
 * Script to migrate existing blog posts content to database
 * Run with: node scripts/migrate-blog-content.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
const matter = require('gray-matter')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateBlogContent() {
  console.log('🚀 Starting blog content migration...\n')

  // 1. Get all blog posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching posts:', error)
    process.exit(1)
  }

  if (!posts || posts.length === 0) {
    console.log('ℹ️  No blog posts found in database')
    return
  }

  console.log(`📝 Found ${posts.length} blog post(s)\n`)

  // 2. For each post, read content from file and update database
  let successCount = 0
  let errorCount = 0

  for (const post of posts) {
    console.log(`📄 Processing: ${post.title}`)
    
    // Skip if content already exists
    if (post.content && post.content.length > 0) {
      console.log(`  ✅ Content already exists, skipping\n`)
      successCount++
      continue
    }

    try {
      // Read content from MDX file
      const contentPath = path.join(process.cwd(), post.content_path)
      const fileContent = await fs.readFile(contentPath, 'utf-8')
      const parsed = matter(fileContent)
      const content = parsed.content

      if (!content || content.length === 0) {
        console.log(`  ⚠️  No content found in file\n`)
        errorCount++
        continue
      }

      // Update database with content
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ content })
        .eq('id', post.id)

      if (updateError) {
        console.log(`  ❌ Error updating database: ${updateError.message}\n`)
        errorCount++
        continue
      }

      console.log(`  ✅ Successfully migrated (${content.length} characters)\n`)
      successCount++
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Migration complete!`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Errors:  ${errorCount}`)
  console.log('='.repeat(50))
}

migrateBlogContent().catch(console.error)
