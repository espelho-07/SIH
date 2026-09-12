import { z } from 'zod';

export const doctorQuerySchema = z.object({
  specialization: z.string().optional(),
  hospitalId: z.string().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN']).optional(),
  search: z.string().optional(),
});

export const doctorIdParamSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

export const createDoctorSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  name: z.string().min(2),
  specialization: z.string().min(2),
  qualification: z.string().min(2),
  phone: z.string().min(5),
  consultationStart: z.string().optional().default('09:00 AM'),
  consultationEnd: z.string().optional().default('05:00 PM'),
  availabilityStatus: z.enum(['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN']).optional().default('AVAILABLE'),
  isActive: z.boolean().optional().default(true),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
