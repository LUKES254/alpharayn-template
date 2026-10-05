const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, description, status')
    .limit(10)
  
  console.log('Blog posts in database:', data?.length || 0)
  if (data && data.length > 0) {
    console.log('\nFirst few posts:')
    data.forEach(post => {
      console.log(`- ${post.title} (${post.status})`)
      console.log(`  Description: ${post.description?.substring(0, 100)}...`)
    })
  } else {
    console.log('No blog posts found in production database!')
  }
  
  if (error) console.error('Error:', error)
}

checkPosts()
