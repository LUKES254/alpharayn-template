import { z } from 'zod'

// Valid subscription tiers
export const SubscriptionTierEnum = z.enum(['pro', 'premium'])

// Valid currencies
export const CurrencyEnum = z.enum(['NGN', 'USD', 'KES'])

// Valid payment statuses
export const PaymentStatusEnum = z.enum([
  'pending',
  'success',
  'failed',
  'abandoned',
  'refunded',
  'disputed'
])

// Payment initialization validation
export const InitializePaymentSchema = z.object({
  amount: z.number()
    .int('Amount must be an integer')
    .positive('Amount must be positive')
    .max(100000000, 'Amount too large'), // 1M in minor units (10M NGN)
  tier: SubscriptionTierEnum,
  currency: CurrencyEnum.default('NGN'),
  planId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Payment verification validation
export const VerifyPaymentSchema = z.object({
  reference: z.string()
    .min(1, 'Payment reference is required')
    .max(100, 'Reference too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid reference format'),
})

// Webhook payload validation
export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    paid_at: z.string().optional(),
    customer: z.object({
      email: z.string().email(),
    }).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
})

// Payment status update validation (admin)
export const UpdatePaymentStatusSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  status: PaymentStatusEnum,
  notes: z.string().max(500).optional(),
})

// One-time payment initialization validation
export const InitializeOneTimePaymentSchema = z.object({
  amount: z.number()
    .int('Amount must be an integer')
    .positive('Amount must be positive')
    .max(100000000, 'Amount too large'),
  productId: z.string().uuid('Invalid product ID'),
  currency: CurrencyEnum.default('KES'),
  metadata: z.record(z.string(), z.any()).optional(),
})

// One-time product validation (for admin creation)
export const CreateOneTimeProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  category: z.string().max(50).optional(),
  features: z.array(z.string()).optional(),
  icon: z.string().max(50).optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
})

export type CreateOneTimeProductInput = z.infer<typeof CreateOneTimeProductSchema>
export type InitializeOneTimePaymentInput = z.infer<typeof InitializeOneTimePaymentSchema>
