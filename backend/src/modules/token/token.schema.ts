import { z } from 'zod';

export const createTokenSchema = z.object({
  hospitalId: z.string().optional(),
  doctorId: z.string().optional(),
  facilityId: z.string().optional(),
  facilityName: z.string().optional(),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientAge: z.number().optional(),
  patientGender: z.enum(['M', 'F', 'Other']).optional(),
  appointmentId: z.string().optional(),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional(),
});

export const tokenQuerySchema = z.object({
  status: z.enum(['WAITING', 'CALLED', 'IN_PROGRESS', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'NO_SHOW', 'CANCELLED']).optional(),
  date: z.string().optional(),
  upcoming: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  patientId: z.string().optional(),
  facilityId: z.string().optional(),
});

export const tokenIdParamSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
});

export const queueParamSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

export const updateTokenStatusSchema = z.object({
  status: z.enum(['WAITING', 'CALLED', 'IN_PROGRESS', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'NO_SHOW', 'CANCELLED']),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type TokenQuery = z.infer<typeof tokenQuerySchema>;
export type UpdateTokenStatusInput = z.infer<typeof updateTokenStatusSchema>;
