import { z } from 'zod'

// Admin user management validation
export const AdminUpdateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional(),
  roleId: z.string().uuid('Invalid role ID').optional(),
  subscriptionTier: z.enum(['free', 'pro', 'premium']).optional(),
})

// Admin payment filter validation
export const AdminPaymentFilterSchema = z.object({
  status: z.enum(['pending', 'success', 'failed', 'abandoned', 'refunded', 'disputed']).optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

// Admin action validation
export const AdminActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend', 'activate', 'delete']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason too long'),
})
