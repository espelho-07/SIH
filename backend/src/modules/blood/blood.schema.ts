import { z } from 'zod';

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const emergencyBloodQuerySchema = z.object({
  bloodGroup: z.enum(bloodGroups, {
    invalid_type_error: 'Invalid blood group. Allowed values: A+, A-, B+, B-, AB+, AB-, O+, O-',
  }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().default(30), // in kilometers
});

export const updateBloodInventorySchema = z.object({
  availableUnits: z.number().int().min(0, 'Available units cannot be negative'),
  status: z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']).optional(),
});

export const createBloodInventorySchema = z.object({
  bloodGroup: z.enum(bloodGroups),
  availableUnits: z.number().int().min(0, 'Available units cannot be negative'),
  status: z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']).optional().default('AVAILABLE'),
});

export const hospitalBloodParamSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  bloodGroup: z.string().optional(),
});

export type EmergencyBloodQuery = z.infer<typeof emergencyBloodQuerySchema>;
export type UpdateBloodInventoryInput = z.infer<typeof updateBloodInventorySchema>;
export type CreateBloodInventoryInput = z.infer<typeof createBloodInventorySchema>;
