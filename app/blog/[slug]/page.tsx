import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { ShareButtons } from '@/components/blog/share-buttons'
import { BlogCard } from '@/components/blog/blog-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Zap, ArrowLeft } from 'lucide-react'
import { BlogContent } from '@/components/blog/blog-content'

// Helper to check if URL is a valid image URL
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const parsedUrl = new URL(url)
    // Check if it looks like an image URL (has image extension or common image CDN patterns)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']
    const hasImageExtension = imageExtensions.some(ext => parsedUrl.pathname.toLowerCase().includes(ext))
    const isImageCDN = ['unsplash.com', 'images.unsplash.com', 'cloudinary.com', 'imgur.com', 'i.imgur.com', 'pexels.com', 'images.pexels.com'].some(cdn => parsedUrl.hostname.includes(cdn))
    // Also accept URLs with image in path or query
    const hasImagePath = parsedUrl.pathname.includes('/image') || parsedUrl.search.includes('image')
    return hasImageExtension || isImageCDN || hasImagePath
  } catch {
    return false
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPost(slug: string) {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return null
    }

    // Try to get content from database first (production-friendly)
    let content = post.content || ''
    
    // Fallback: Read from MDX file if content is empty and content_path exists
    if (!content && post.content_path) {
      try {
        const contentPath = path.join(process.cwd(), post.content_path)
        const fileContent = await fs.readFile(contentPath, 'utf-8')
        const parsed = matter(fileContent)
        content = parsed.content
      } catch (fileError) {
        console.error('Error reading MDX file:', fileError)
        // Leave content empty if file read fails
      }
    }

    // Get related posts
    const { data: relatedPosts } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .neq('slug', slug)
      .or(`category.eq.${post.category},tags.cs.{${post.tags?.[0] || ''}}`)
      .limit(3)

    return {
      post,
      content,
      relatedPosts: relatedPosts || [],
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// Track view on client side
async function trackView(slug: string) {
  'use server'
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/${slug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
  } catch (error) {
    // Silently fail view tracking
    console.error('View tracking failed:', error)
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getPost(params.slug)

  if (!data) {
    notFound()
  }

  const { post, content, relatedPosts } = data

  // Track view (fire and forget)
  trackView(params.slug).catch(() => {})

  return (
    <>
      <ReadingProgress />
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Badge variant="outline" className="mb-4">
              {post.category}
            </Badge>
          )}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.published_at && (
              <span>{formatDate(post.published_at)}</span>
            )}
            <span>•</span>
            <span>{post.reading_time || 1} min read</span>
            {post.view_count !== undefined && post.view_count > 0 && (
              <>
                <span>•</span>
                <span>{post.view_count} views</span>
              </>
            )}
          </div>

          {/* Share Buttons */}
          <div className="mt-6">
            <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
          </div>
        </header>

        {/* Hero Image */}
        {post.og_image_url && (
          <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
            {isValidImageUrl(post.og_image_url) ? (
              <Image
                src={post.og_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Zap className="h-16 w-16 text-primary/40" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <BlogContent content={content} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Share Footer */}
        <div className="border-t pt-8 mb-12">
          <h3 className="text-lg font-semibold mb-4">Share this post</h3>
          <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getPost(params.slug)

  if (!data) {
    return {
      title: 'Post Not Found',
    }
  }

  const { post } = data

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.og_image_url ? [post.og_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.og_image_url ? [post.og_image_url] : [],
    },
  }
}

