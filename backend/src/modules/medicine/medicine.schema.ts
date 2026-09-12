import { z } from 'zod';

export const medicineQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
});

export const medicineIdParamSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
});

export const medicineAvailabilityQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().default(20), // in kilometers
});

export const createMedicineSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().min(2),
  category: z.string().min(2),
  unit: z.string().optional().default('Tablet'),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateMedicineSchema = createMedicineSchema.partial();

export const updateStockSchema = z.object({
  quantity: z.number().int().min(0),
  availabilityStatus: z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK', 'UNKNOWN']),
});

export type MedicineQuery = z.infer<typeof medicineQuerySchema>;
export type MedicineAvailabilityQuery = z.infer<typeof medicineAvailabilityQuerySchema>;
export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
