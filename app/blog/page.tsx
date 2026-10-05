import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { formatDate, isValidImageUrl } from '@/lib/utils'
import { Calendar, ArrowRight, Zap, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/footer'
import { NewsletterCTA } from '@/components/newsletter/newsletter-cta'
import { NavToggle } from '@/components/layout/nav-toggle'
import { BlogList } from '@/components/blog/blog-list'
import { BlogHeaderControl } from '@/components/blog/blog-header-control'
import { BlogCard } from '@/components/blog/blog-card'
import { CategorySection } from '@/components/blog/category-section'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  category?: string | null
  tags?: string[] | null
  og_image_url?: string | null
  reading_time?: number | null
  published_at?: string | null
  created_at?: string | null
  featured?: boolean
  author?: { name: string | null } | null
}

async function getBlogData() {
  try {
    // Note: In a real app with many posts, you'd want to use separate queries or a more efficient join strategy
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, author:users(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return { posts: [], featuredPost: null, sidePosts: [], latestPosts: [] }
    }

    // Get featured post (first featured or most recent)
    const featuredPost = posts?.find((p) => p.featured) || posts?.[0] || null
    
    // Get side posts (next 3 after featured)
    const remainingPosts = posts?.filter((p) => p.id !== featuredPost?.id) || []
    const sidePosts = remainingPosts.slice(0, 3)
    
    // Get latest posts (rest of the posts)
    // For the "Latest Articles" section, we want the most recent ones overall
    // We will slice in the component, but here we can just pass the full remaining list
    const latestPosts = remainingPosts

    return {
      posts: posts || [],
      featuredPost,
      sidePosts,
      latestPosts,
    }
  } catch (error) {
    console.error('Error in getBlogData:', error)
    return { posts: [], featuredPost: null, sidePosts: [], latestPosts: [] }
  }
}

export default async function BlogPage({ searchParams }: { searchParams: { search?: string; category?: string; page?: string } }) {
  const { posts, featuredPost, sidePosts, latestPosts } = await getBlogData()
  
  // Extract categories and tags for the filter component
  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[]
  const tags = Array.from(new Set(posts.flatMap(p => p.tags || []).filter(Boolean))) as string[]

  const isSearching = !!searchParams.search || !!searchParams.category

  // Group posts by category for "Individual Blog Categories" section
  // We need up to 8 posts per category to fill the complex layout
  const postsByCategory = categories.reduce((acc, category) => {
    acc[category] = posts.filter(p => p.category === category).slice(0, 8)
    return acc
  }, {} as Record<string, BlogPost[]>)

  return (
    <div className="min-h-screen bg-background">
       <NavToggle />
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-8">
              Insights & <span className="text-primary">Perspectives</span>
            </h1>
            
            {/* Header Search & Filter */}
            <BlogHeaderControl categories={categories} />
          </div>

          {/* Conditional Layout: Search Results vs Full Magazine Layout */}
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <h2 className="text-2xl font-bold mb-8">Search Results</h2>
              <BlogList 
                initialPosts={[]} // Let BlogList fetch filtered data
                categories={categories}
                tags={tags}
                hideSearch={true}
                hideFilters={true} // Controlled by Header
              />
            </div>
          ) : (
            <>
                                            {/* Featured Section */}
                                            {featuredPost && (
                                              <div className="mb-24">
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                                  {/* Main Featured Post */}
                                                  <div className="lg:col-span-8 group relative">
                                                    <Link href={`/blog/${featuredPost.slug}`} className="block h-full">
                                                      <div className="relative aspect-[4/5] sm:aspect-video lg:aspect-[16/9] min-h-[550px] sm:min-h-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-primary/20">
                                                        {isValidImageUrl(featuredPost.og_image_url) ? (
                                                          <Image
                                                            src={featuredPost.og_image_url!}
                                                            alt={featuredPost.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            sizes="(max-width: 1024px) 100vw, 66vw"
                                                            priority
                                                          />
                                                        ) : (
                                                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                                            <Zap className="h-20 w-20 text-primary/40" />
                                                          </div>
                                                        )}
                                                        
                                                        {/* Gradient Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                                                        
                                                        {/* Content Overlay */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12">
                                                          {featuredPost.category && (
                                                            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-primary/90 rounded-full backdrop-blur-sm">
                                                              {featuredPost.category}
                                                            </span>
                                                          )}
                                                          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-primary-foreground/90 transition-colors line-clamp-4 sm:line-clamp-none">
                                                            {featuredPost.title}
                                                          </h2>
                                                          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm md:text-base mb-6">
                                                            <div className="flex items-center gap-2">
                                                              <Calendar className="h-4 w-4" />
                                                              <span>{formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                                                            </div>
                                                            {featuredPost.reading_time && (
                                                              <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                <span>{featuredPost.reading_time} min read</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                          <p className="text-gray-300 line-clamp-2 md:line-clamp-3 max-w-3xl text-base sm:text-lg lg:text-xl">
                                                            {featuredPost.description}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </Link>
                                                  </div>
                                  
                                                  {/* Side Posts - Top Stories */}
                                                  <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                                                    <div className="flex items-center justify-between mb-2">
                                                      <h3 className="text-xl font-bold text-foreground border-l-4 border-primary pl-4">Top Stories</h3>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
                                                      {sidePosts.map((post) => (
                                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block flex-1">
                                                          <div className="flex flex-col sm:flex-row lg:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors h-full">
                                                            <div className="relative w-full sm:w-24 sm:h-24 aspect-video sm:aspect-square flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                                                              {isValidImageUrl(post.og_image_url) ? (
                                                                <Image
                                                                  src={post.og_image_url!}
                                                                  alt={post.title}
                                                                  fill
                                                                  className="object-cover"
                                                                  sizes="(max-width: 640px) 100vw, 96px"
                                                                />
                                                              ) : (
                                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                                                                  <Zap className="h-6 w-6 text-primary/40" />
                                                                </div>
                                                              )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                              <div>
                                                                {post.category && (
                                                                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{post.category}</p>
                                                                )}
                                                                <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                                  {post.title}
                                                                </h3>
                                                              </div>
                                                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                                                                <span>{formatDate(post.published_at || post.created_at)}</span>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </Link>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                                              {/* Latest Articles Section (Reordered to top) */}
              <div id="latest-articles" className="scroll-mt-24 mb-24">
                <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">
                    Latest Articles
                  </h2>
                </div>
                
                <BlogList 
                  initialPosts={latestPosts} 
                  categories={categories}
                  tags={tags}
                  hideSearch={true}
                  hideFilters={true}
                  limit={8}
                  layout="grid-2-col"
                />
              </div>

              {/* Individual Blog Categories Sections */}
              <div className="space-y-20">
                {Object.entries(postsByCategory).map(([category, catPosts]) => {
                  // Deterministic "random" variant based on category name
                  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  const variant = hash % 2 === 0 ? 'default' : 'alternate'
                  
                  return (
                    <CategorySection 
                      key={category} 
                      category={category} 
                      posts={catPosts} 
                      variant={variant}
                    />
                  )
                })}
              </div>
            </>
          )}

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                No articles yet
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                We're crafting some amazing content for you. Check back soon!
              </p>
              <Link href="/">
                <Button size="lg" className="rounded-full">Back to Home</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <NewsletterCTA />
      <Footer />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Blog | Insights & Perspectives',
    description: 'Discover our latest articles, tutorials, and insights on technology and design.',
  }
}

