import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { UpdateBlogPostSchema } from '@/lib/validation/blog-schema'
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
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Helper function to calculate reading time
 */
function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}

/**
 * Helper function to get session token from cookies
 */
async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  // Better Auth uses "better-auth.session_token" format
  // Also check for secure prefix version
  const sessionCookie = cookieStore.get('better-auth.session_token') || 
                        cookieStore.get('__Secure-better-auth.session_token')
  return sessionCookie?.value
}

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

/**
 * GET /api/admin/blog/[slug]
 * Get a single blog post (draft or published) for editing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    await requireAdminRole()

    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    // Fetch post from database
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !post) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    // Read MDX file content
    const contentPath = path.join(process.cwd(), post.content_path)
    
    try {
      const fileContent = await fs.readFile(contentPath, 'utf-8')
      const parsed = matter(fileContent)

      return NextResponse.json({
        post: {
          ...post,
          content: parsed.content,
        },
        correlationId,
      })
    } catch (fileError) {
      console.error('Error reading MDX file:', fileError)
      throw new APIError(
        500,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to read blog post content'
      )
    }
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/[slug]',
      method: 'GET',
      slug: params.slug,
    })
  }
}

/**
 * PATCH /api/admin/blog/[slug]
 * Update an existing blog post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    // Get session and check admin role
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

    // Validate CSRF token - get session token from session object first, then fall back to cookies
    const csrfToken = request.headers.get('x-csrf-token')
    // Try session object first (same as CSRF endpoint), then fall back to cookie
    let sessionToken: string | undefined = (session as any)?.token || (session as any)?.session?.token
    if (!sessionToken) {
      sessionToken = await getSessionToken()
    }
    
    if (!sessionToken || !csrfToken || !validateCSRFToken(csrfToken, sessionToken)) {
      console.log('[PATCH Debug] CSRF validation failed:', { hasSessionToken: !!sessionToken, hasCsrfToken: !!csrfToken })
      throw new APIError(403, ErrorCodes.CSRF_TOKEN_INVALID, 'Invalid CSRF token')
    }

    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fetchError || !existingPost) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    const body = await request.json()
    
    // Validate input
    const validated = UpdateBlogPostSchema.safeParse(body)
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
    const updateData: Record<string, unknown> = {}

    // Handle slug change (if provided and different)
    let newSlug = slug
    if (data.slug && data.slug !== slug) {
      // Check if new slug exists
      const { data: slugExists } = await supabaseAdmin
        .from('blog_posts')
        .select('slug')
        .eq('slug', data.slug)
        .single()

      if (slugExists) {
        throw new APIError(409, ErrorCodes.ALREADY_EXISTS, 'A post with this slug already exists')
      }

      newSlug = data.slug
      updateData.slug = newSlug
    }

    // Update fields if provided
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.category) updateData.category = data.category
    if (data.tags) updateData.tags = data.tags
    if (data.status !== undefined) {
      updateData.status = data.status
      if (data.status === 'published' && existingPost.status === 'draft') {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.og_image_url !== undefined) updateData.og_image_url = data.og_image_url || null

    // Handle content update
    let readingTimeMinutes = existingPost.reading_time
    if (data.content) {
      readingTimeMinutes = calculateReadingTime(data.content)
      updateData.reading_time = readingTimeMinutes
      updateData.content = data.content // Store content in database

      // Update MDX file
      const oldContentPath = path.join(process.cwd(), existingPost.content_path)
      const newContentPath = path.join(process.cwd(), 'content', 'blog', `${newSlug}.mdx`)

      // Read existing frontmatter or create new
      let frontmatter: Record<string, unknown> = {}
      try {
        const existingContent = await fs.readFile(oldContentPath, 'utf-8')
        const parsed = matter(existingContent)
        frontmatter = parsed.data
      } catch {
        // File doesn't exist or can't be read, use defaults
        frontmatter = {
          title: data.title || existingPost.title,
          description: data.description || existingPost.description,
          category: data.category || existingPost.category,
          tags: data.tags || existingPost.tags,
          og_image_url: data.og_image_url || existingPost.og_image_url || '',
          featured: data.featured !== undefined ? data.featured : existingPost.featured,
        }
      }

      // Update frontmatter with new values
      if (data.title) frontmatter.title = data.title
      if (data.description) frontmatter.description = data.description
      if (data.category) frontmatter.category = data.category
      if (data.tags) frontmatter.tags = data.tags
      if (data.og_image_url !== undefined) frontmatter.og_image_url = data.og_image_url || ''
      if (data.featured !== undefined) frontmatter.featured = data.featured

      // Write new MDX file
      const mdxContent = matter.stringify(data.content, frontmatter)
      await fs.writeFile(newContentPath, mdxContent, 'utf-8')

      // Update content_path if slug changed
      if (newSlug !== slug) {
        updateData.content_path = `content/blog/${newSlug}.mdx`
        
        // Delete old file
        await fs.unlink(oldContentPath).catch(() => {})
      } else {
        // Update existing file
        await fs.writeFile(oldContentPath, mdxContent, 'utf-8')
      }
    }

    // Update database record
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating blog post:', updateError)
      throw new Error('Failed to update blog post')
    }

    return NextResponse.json({
      post: updatedPost,
      message: 'Blog post updated successfully',
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/[slug]',
      method: 'PATCH',
      slug: params.slug,
    })
  }
}

/**
 * DELETE /api/admin/blog/[slug]
 * Delete a blog post (removes database record and MDX file)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const correlationId = generateCorrelationId()

  try {
    // Get session and check admin role
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

    // Validate CSRF token - get session token from session object first, then fall back to cookies
    const csrfToken = request.headers.get('x-csrf-token')
    let sessionToken: string | undefined = (session as any)?.token || (session as any)?.session?.token
    if (!sessionToken) {
      sessionToken = await getSessionToken()
    }
    if (!sessionToken || !csrfToken || !validateCSRFToken(csrfToken, sessionToken)) {
      throw new APIError(403, ErrorCodes.CSRF_TOKEN_INVALID, 'Invalid CSRF token')
    }

    const { slug } = params

    if (!slug) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Slug is required')
    }

    // Fetch post to get content_path
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('content_path')
      .eq('slug', slug)
      .single()

    if (fetchError || !post) {
      throw new APIError(404, ErrorCodes.NOT_FOUND, 'Blog post not found')
    }

    // Delete database record (CASCADE will delete blog_views)
    const { error: deleteError } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      console.error('Error deleting blog post:', deleteError)
      throw new Error('Failed to delete blog post')
    }

    // Delete MDX file
    const contentPath = path.join(process.cwd(), post.content_path)
    await fs.unlink(contentPath).catch((err) => {
      // Log but don't fail if file doesn't exist
      console.warn('Error deleting MDX file:', err)
    })

    return NextResponse.json({
      message: 'Blog post deleted successfully',
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/[slug]',
      method: 'DELETE',
      slug: params.slug,
    })
  }
}

