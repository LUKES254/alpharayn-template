import { z } from 'zod'

// Newsletter subscription schemas
export const NewsletterPreferencesSchema = z.object({
  product_updates: z.boolean().default(true),
  blog_posts: z.boolean().default(true),
  promotions: z.boolean().default(false),
})

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email().max(255),
  source: z.string().max(100).optional(),
  preferences: NewsletterPreferencesSchema.optional(),
  metadata: z.record(z.any()).optional(),
})

export const NewsletterUpdatePreferencesSchema = z.object({
  preferences: NewsletterPreferencesSchema,
})

// Waitlist schemas
export const WaitlistJoinSchema = z.object({
  email: z.string().email().max(255),
  full_name: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  referred_by_code: z.string().max(100).optional(),
  use_case: z.string().max(500).optional(),
  company_size: z.enum(['1-10','11-50','51-200','201-1000','1000+']).optional(),
  utm_source: z.string().max(150).optional(),
  utm_medium: z.string().max(150).optional(),
  utm_campaign: z.string().max(150).optional(),
  metadata: z.record(z.any()).optional(),
})

// Campaign schemas
export const CampaignCreateSchema = z.object({
  title: z.string().min(3).max(200),
  subject: z.string().min(5).max(200),
  preview_text: z.string().max(200).optional(),
  content: z.string().min(50),
  scheduled_at: z.string().datetime().optional(),
})

// Types
export type NewsletterSubscribeInput = z.infer<typeof NewsletterSubscribeSchema>
export type NewsletterUpdatePreferencesInput = z.infer<typeof NewsletterUpdatePreferencesSchema>
export type WaitlistJoinInput = z.infer<typeof WaitlistJoinSchema>
export type CampaignCreateInput = z.infer<typeof CampaignCreateSchema>
