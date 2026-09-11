import { apiRequest } from './client';
import { Referral, CreateReferralRequest } from '@/types/referral';

export const referralApi = {
  getAll: (params?: { facilityId?: string; status?: string; priority?: string }) =>
    apiRequest<Referral[]>('/referrals', 'GET', params),

  getById: (id: string) =>
    apiRequest<Referral>(`/referrals/${id}`, 'GET'),

  create: (data: CreateReferralRequest) =>
    apiRequest<Referral>('/referrals', 'POST', data),

  accept: (id: string, appointmentSlot?: string) =>
    apiRequest<Referral>(`/referrals/${id}/accept`, 'POST', { appointmentSlot }),

  reject: (id: string, reason: string) =>
    apiRequest<Referral>(`/referrals/${id}/reject`, 'POST', { reason }),

  confirmArrival: (id: string) =>
    apiRequest<Referral>(`/referrals/${id}/confirm-arrival`, 'POST'),

  recordOutcome: (id: string, outcomeNotes: string) =>
    apiRequest<Referral>(`/referrals/${id}/outcome`, 'POST', { outcomeNotes }),

  close: (id: string) =>
    apiRequest<Referral>(`/referrals/${id}/close`, 'POST'),
};
