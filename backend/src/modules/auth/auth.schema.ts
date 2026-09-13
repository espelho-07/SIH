import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['USER', 'ADMIN', 'HOSPITAL_STAFF']).optional().default('USER'),
});

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional().default(''),
  role: z.string().optional(),
  staffSubType: z.string().optional(),
}).refine((data) => !!data.identifier || !!data.email, {
  message: 'Identifier or email is required for login',
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
