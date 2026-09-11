import { apiRequest } from './client';
import { AshaPatient, AshaVisit, ScreeningSession } from '@/types/asha';
import { Vitals } from '@/types/clinical';

export const ashaApi = {
  getPatients: () =>
    apiRequest<AshaPatient[]>('/asha/patients', 'GET'),

  registerPatient: (data: Partial<AshaPatient>) =>
    apiRequest<AshaPatient>('/asha/patients', 'POST', data),

  getVisits: () =>
    apiRequest<AshaVisit[]>('/asha/visits', 'GET'),

  recordVitals: (patientId: string, vitals: Partial<Vitals>) =>
    apiRequest<Vitals>(`/asha/patients/${patientId}/vitals`, 'POST', vitals),

  saveScreening: (session: Partial<ScreeningSession>) =>
    apiRequest<ScreeningSession>('/asha/screenings', 'POST', session),

  pushSyncQueue: (items: unknown[]) =>
    apiRequest<{ syncedCount: number; serverTimestamp: string }>('/sync/push', 'POST', { items }),
};
