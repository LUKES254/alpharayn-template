import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateBlogPostSchema } from '@/lib/validation/blog-schema'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { validateCSRFToken } from '@/lib/csrf'
import { auth } from '@/lib/auth'
import { headers, cookies } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

// Disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Helper function to generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Helper function to calculate reading time
 */
function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}

/**
 * GET /api/admin/blog
 * List all blog posts (draft + published) for admin
 */
/**
 * Helper function to check admin role in API routes (no redirects)
 */
async function requireAdminRole(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
  if (!adminEmails.includes(session.user.email)) {
    throw new APIError(403, ErrorCodes.FORBIDDEN, 'Admin access required')
  }
}

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId()

  try {
    await requireAdminRole()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'draft', 'published', or null (all)

    let queryBuilder = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status && (status === 'draft' || status === 'published')) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data: posts, error, count } = await queryBuilder

    if (error) {
      console.error('Error fetching blog posts:', error)
      throw new Error('Failed to fetch blog posts')
    }

    // Get view counts for each post
    const postsWithStats = await Promise.all(
      (posts || []).map(async (post) => {
        const { count: viewCount } = await supabaseAdmin
          .from('blog_views')
          .select('*', { count: 'exact', head: true })
          .eq('post_slug', post.slug)

        return {
          ...post,
          total_views: viewCount || 0,
        }
      })
    )

    return NextResponse.json({
      posts: postsWithStats,
      total: count || 0,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog',
      method: 'GET',
    })
  }
}

/**
 * POST /api/admin/blog
 * Create a new blog post
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()

  try {
    // Get session and check admin role (no redirects in API routes)
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new APIError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required')
    }

    // Check admin role
    const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map((s) => s.trim()) || []
    if (!adminEmails.includes(session.user.email)) {
      throw new APIError(403, ErrorCodes.FORBIDDEN, 'Admin access required')
    }

    // Get session token for CSRF validation - try multiple sources
    let sessionToken: string | undefined = (session as any)?.token || (session as any)?.session?.token
    
    if (!sessionToken) {
      const cookieStore = await cookies()
      // Better Auth uses "better-auth.session_token" format
      const sessionCookie = cookieStore.get('better-auth.session_token') || 
                            cookieStore.get('__Secure-better-auth.session_token')
      sessionToken = sessionCookie?.value
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token')
    if (!csrfToken || !sessionToken || !validateCSRFToken(csrfToken, sessionToken)) {
      throw new APIError(403, ErrorCodes.CSRF_TOKEN_INVALID, 'Invalid CSRF token')
    }

    const body = await request.json()
    
    // Validate input
    const validated = CreateBlogPostSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: ErrorCodes.VALIDATION_ERROR,
          details: validated.error.errors,
          correlationId,
        },
        { status: 400 }
      )
    }

    const data = validated.data

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title)

    // Check if slug already exists
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      throw new APIError(409, ErrorCodes.ALREADY_EXISTS, 'A post with this slug already exists')
    }

    // Calculate reading time
    const readingTimeMinutes = calculateReadingTime(data.content)

    // Create content directory if it doesn't exist
    const contentDir = path.join(process.cwd(), 'content', 'blog')
    await fs.mkdir(contentDir, { recursive: true })

    // Create MDX file path
    const contentPath = path.join(contentDir, `${slug}.mdx`)

    // Write MDX file with frontmatter
    const frontmatter = {
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags,
      og_image_url: data.og_image_url || '',
      featured: data.featured || false,
    }

    const mdxContent = matter.stringify(data.content, frontmatter)
    await fs.writeFile(contentPath, mdxContent, 'utf-8')

    // Create database record
    const postData = {
      slug,
      title: data.title,
      description: data.description,
      content: data.content, // Store content in database
      content_path: `content/blog/${slug}.mdx`,
      author_id: session.user.id,
      status: data.status,
      featured: data.featured || false,
      category: data.category,
      tags: data.tags,
      og_image_url: data.og_image_url || null,
      reading_time: readingTimeMinutes,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
    }

    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      // Clean up file if database insert fails
      await fs.unlink(contentPath).catch(() => {})
      console.error('Error creating blog post:', error)
      throw new Error('Failed to create blog post')
    }

    return NextResponse.json(
      {
        post,
        message: 'Blog post created successfully',
        correlationId,
      },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog',
      method: 'POST',
    })
  }
}

