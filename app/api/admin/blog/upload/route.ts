import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleAPIError, APIError, ErrorCodes, generateCorrelationId } from '@/lib/error-handler'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

/**
 * POST /api/admin/blog/upload
 * Upload an image for blog posts
 */
export async function POST(request: NextRequest) {
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

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'No file provided')
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new APIError(
        400,
        ErrorCodes.VALIDATION_ERROR,
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new APIError(
        400,
        ErrorCodes.VALIDATION_ERROR,
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars
      .substring(0, 30) // Limit length
    const fileName = `${timestamp}-${randomString}-${sanitizedName}.${extension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new APIError(
        500,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to upload image'
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/upload',
      method: 'POST',
    })
  }
}

/**
 * DELETE /api/admin/blog/upload
 * Delete an uploaded image
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      throw new APIError(400, ErrorCodes.VALIDATION_ERROR, 'Image path is required')
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('blog-images')
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      throw new APIError(
        500,
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to delete image'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      correlationId,
    })
  } catch (error) {
    return handleAPIError(error, correlationId, {
      route: '/api/admin/blog/upload',
      method: 'DELETE',
    })
  }
}
