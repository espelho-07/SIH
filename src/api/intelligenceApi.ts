import { apiRequest } from './client';
import {
  DistrictHealthSummary,
  AreaIntelligenceProfile,
  FacilityGapProfile,
  SpecialistShortageItem,
  EquipmentGapItem,
  MedicineShortageItem,
  DiagnosticGapItem,
  EvidenceRecommendation,
  DistrictAiQueryResponse,
} from '@/types/intelligence';

export const intelligenceApi = {
  getSummary: (district: string = 'Gandhinagar', timeRange: 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' = 'TODAY') =>
    apiRequest<DistrictHealthSummary>('/district/intelligence/summary', 'GET', { district, timeRange }),

  getAreas: (district: string = 'Gandhinagar') =>
    apiRequest<AreaIntelligenceProfile[]>('/district/intelligence/areas', 'GET', { district }),

  getFacilities: (district: string = 'Gandhinagar') =>
    apiRequest<FacilityGapProfile[]>('/district/intelligence/facilities', 'GET', { district }),

  getSpecialistGaps: (district: string = 'Gandhinagar') =>
    apiRequest<SpecialistShortageItem[]>('/district/intelligence/specialist-gaps', 'GET', { district }),

  getEquipmentGaps: (district: string = 'Gandhinagar') =>
    apiRequest<EquipmentGapItem[]>('/district/intelligence/equipment-gaps', 'GET', { district }),

  getMedicineShortages: (district: string = 'Gandhinagar') =>
    apiRequest<MedicineShortageItem[]>('/district/intelligence/medicine-shortages', 'GET', { district }),

  getDiagnosticGaps: (district: string = 'Gandhinagar') =>
    apiRequest<DiagnosticGapItem[]>('/district/intelligence/diagnostic-gaps', 'GET', { district }),

  getRecommendations: (district: string = 'Gandhinagar') =>
    apiRequest<EvidenceRecommendation[]>('/district/intelligence/recommendations', 'GET', { district }),

  queryAi: (query: string, district: string = 'Gandhinagar') =>
    apiRequest<DistrictAiQueryResponse>('/district/intelligence/query', 'POST', { query, district }),
};
