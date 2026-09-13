import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().optional().default('usr_doc_01'),
  doctorName: z.string().optional(),
  hospitalId: z.string().optional(),
  facilityId: z.string().optional().default('fac_civil_01'),
  facilityName: z.string().optional().default('Gandhinagar Civil Hospital'),
  specialty: z.string().optional().default('General Medicine'),
  appointmentDate: z.string().optional(),
  date: z.string().optional(),
  timeSlot: z.string().optional().default('10:30 AM'),
  reason: z.string().optional().default('General Consultation'),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientAge: z.number().optional(),
  patientGender: z.enum(['M', 'F', 'Other']).optional(),
  type: z.enum(['IN_PERSON', 'TELECONSULTATION']).optional(),
});

export const getSlotsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date parameter must be in YYYY-MM-DD format'),
});

export const myAppointmentsQuerySchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  upcoming: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  past: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
});

export const appointmentIdParamSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type GetSlotsQuery = z.infer<typeof getSlotsQuerySchema>;
export type MyAppointmentsQuery = z.infer<typeof myAppointmentsQuerySchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
