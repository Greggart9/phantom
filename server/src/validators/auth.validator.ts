import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password must be alphanumeric (contain both letters and numbers)'),
  confirmPassword: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password must be alphanumeric (contain both letters and numbers)')
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional()
});

export const requestPasswordChangeSchema = z.object({
  // email is optional since user is authenticated
  email: z.string().email().optional()
});

export const confirmPasswordChangeSchema = z.object({
  code: z.string().min(1, 'Confirmation code is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Password must be alphanumeric (contain both letters and numbers)'),
  confirmPassword: z.string().optional()
});

export const magicLinkRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address')
});

export const verifyMagicLinkSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const googleAuthSchema = z.object({
  credential: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  googleId: z.string().optional()
});