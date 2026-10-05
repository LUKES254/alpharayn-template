import { z } from 'zod'

// Password validation schema with strong requirements
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .refine((val) => {
    let count = 0
    if (/[a-z]/.test(val)) count++
    if (/[A-Z]/.test(val)) count++
    if (/[0-9]/.test(val)) count++
    if (/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) count++
    return count >= 3
  }, {
    message: 'Password must contain at least 3 of the following: uppercase, lowercase, number, symbol.'
  })

// Profile update validation
export const UpdateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
})

// Password update validation
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

// Email preferences validation
export const EmailPreferencesSchema = z.object({
  marketing: z.boolean(),
  transactional: z.boolean(),
  security: z.boolean(),
})

// User registration validation
export const RegisterUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
  password: PasswordSchema,
})
