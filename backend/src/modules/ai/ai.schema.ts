import { z } from 'zod';

export const symptomAnalysisSchema = z.object({
  symptomsText: z.string().min(3, 'Symptoms description must be at least 3 characters long').max(1000),
  duration: z.string().optional(),
});

export const aiHistoryQuerySchema = z.object({
  limit: z.string().optional(),
});

export type SymptomAnalysisInput = z.infer<typeof symptomAnalysisSchema>;
