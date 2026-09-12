import { z } from 'zod';

export const createTeleconsultationSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  appointmentId: z.string().optional(),
  reason: z.string().min(3, 'Reason must be at least 3 characters long').max(500),
});

export const teleconsultationQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  completed: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export const consultationIdParamSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message text is required').max(2000),
});

export type CreateTeleconsultationInput = z.infer<typeof createTeleconsultationSchema>;
export type TeleconsultationQuery = z.infer<typeof teleconsultationQuerySchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
