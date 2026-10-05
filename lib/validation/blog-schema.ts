import { z } from 'zod'

/**
 * Blog validation schemas using Zod
 * All schemas follow the project's validation patterns
 */

// URL-safe slug validation
const slugRegex = /^[a-z0-9-]+$/

/**
 * Create blog post schema
 */
export const CreateBlogPostSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(), // Auto-generated if not provided
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),
  content: z.string()
    .min(100, 'Content must be at least 100 characters')
    .trim(),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters')
    .trim(),
  tags: z.array(z.string().min(1).max(30))
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  status: z.enum(['draft', 'published'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be either "draft" or "published"',
  }),
  featured: z.boolean().default(false),
  og_image_url: z.string()
    .url('Invalid image URL format')
    .optional()
    .or(z.literal('')),
  seo: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).max(10).optional(),
  }).optional(),
})

/**
 * Update blog post schema (all fields optional)
 */
export const UpdateBlogPostSchema = CreateBlogPostSchema.partial().extend({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug must not exceed 200 characters')
    .regex(slugRegex, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
})

/**
 * Blog view tracking schema
 */
export const BlogViewSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  readPercentage: z.number()
    .min(0, 'Read percentage must be at least 0')
    .max(100, 'Read percentage must not exceed 100')
    .default(0),
  sessionId: z.string().optional(),
})

/**
 * Blog search schema
 */
export const BlogSearchSchema = z.object({
  query: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must not exceed 100 characters')
    .optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(10),
})

/**
 * Blog post status update schema
 */
export const BlogPostStatusSchema = z.object({
  status: z.enum(['draft', 'published'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be either "draft" or "published"',
  }),
})

// TypeScript types exported from schemas
export type CreateBlogPostInput = z.infer<typeof CreateBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>
export type BlogViewInput = z.infer<typeof BlogViewSchema>
export type BlogSearchInput = z.infer<typeof BlogSearchSchema>
export type BlogPostStatusInput = z.infer<typeof BlogPostStatusSchema>

