import { apiRequest } from './client';
import { LiveQueueState, Token, Appointment } from '@/types/queue';

export const queueApi = {
  getLiveQueue: (facilityId: string, departmentId?: string) =>
    apiRequest<LiveQueueState>(`/queues/${facilityId}/live`, 'GET', { departmentId }),

  callNext: (facilityId: string, departmentId: string) =>
    apiRequest<{ calledToken: Token | null; queue: LiveQueueState }>(`/queues/${facilityId}/next`, 'POST', { departmentId }),

  skip: (queueId: string, tokenId: string) =>
    apiRequest<Token>(`/queues/${queueId}/skip`, 'POST', { tokenId }),

  noShow: (queueId: string, tokenId: string) =>
    apiRequest<Token>(`/queues/${queueId}/no-show`, 'POST', { tokenId }),
};

export const tokenApi = {
  generateToken: (data: {
    patientName: string;
    patientPhone: string;
    facilityId: string;
    departmentId: string;
    priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  }) => apiRequest<Token>('/tokens', 'POST', data),

  getById: (tokenId: string) =>
    apiRequest<Token>(`/tokens/${tokenId}`, 'GET'),

  cancelToken: (tokenId: string) =>
    apiRequest<Token>(`/tokens/${tokenId}/cancel`, 'PATCH'),
};

export const appointmentApi = {
  getAll: (patientId?: string) =>
    apiRequest<Appointment[]>('/appointments', 'GET', { patientId }),

  book: (data: Partial<Appointment>) =>
    apiRequest<Appointment>('/appointments', 'POST', data),

  checkIn: (appointmentId: string) =>
    apiRequest<{ appointment: Appointment; token: Token }>(`/appointments/${appointmentId}/check-in`, 'POST'),

  cancel: (appointmentId: string) =>
    apiRequest<Appointment>(`/appointments/${appointmentId}/cancel`, 'PATCH'),
};
