import { z } from 'zod';

export const nearestFacilityQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  facilityType: z.enum(['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER']).optional(),
  service: z.string().optional(),
  emergency: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  radius: z.coerce.number().positive().default(50),
});

export type NearestFacilityQuery = z.infer<typeof nearestFacilityQuerySchema>;
