import { z } from 'zod';

export const hospitalQuerySchema = z.object({
  district: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER']).optional(),
  emergency: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  service: z.string().optional(),
  search: z.string().optional(),
});

export const nearbyHospitalQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().default(10), // in kilometers
  type: z.enum(['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER']).optional(),
  emergency: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  service: z.string().optional(),
});

export const nearbyTreatmentQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  treatment: z.string().min(1, 'Treatment or service name is required'),
  radius: z.coerce.number().positive().default(20), // default 20 km
});

export const treatmentCostQuerySchema = z.object({
  treatment: z.string().min(1, 'Treatment or service name is required'),
  hospitalId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const hospitalIdParamSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
});

export const createHospitalSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER']),
  address: z.string().min(3),
  district: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  openingTime: z.string().optional().default('08:00 AM'),
  closingTime: z.string().optional().default('08:00 PM'),
  emergencyAvailable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

export const updateHospitalSchema = createHospitalSchema.partial();

export type HospitalQuery = z.infer<typeof hospitalQuerySchema>;
export type NearbyHospitalQuery = z.infer<typeof nearbyHospitalQuerySchema>;
export type NearbyTreatmentQuery = z.infer<typeof nearbyTreatmentQuerySchema>;
export type TreatmentCostQuery = z.infer<typeof treatmentCostQuerySchema>;
export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;
export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;
