import { apiRequest } from './client';
import { RegisteredPatient, Appointment, Token } from '@/types/queue';

export const registrationApi = {
  searchPatients: (query?: string) =>
    apiRequest<RegisteredPatient[]>('/clerk/patients', 'GET', { search: query || '' }),

  getPatientById: (id: string) =>
    apiRequest<RegisteredPatient>(`/clerk/patients/${id}`, 'GET'),

  checkDuplicate: (data: { phone?: string; abhaId?: string; name?: string }) =>
    apiRequest<RegisteredPatient | null>('/clerk/patients/check-duplicate', 'POST', data),

  registerPatient: (data: Partial<RegisteredPatient>) =>
    apiRequest<RegisteredPatient>('/clerk/patients/register', 'POST', data),

  getAppointments: (filters?: { patientId?: string; status?: string; date?: string }) =>
    apiRequest<Appointment[]>('/appointments', 'GET', filters),

  checkInAppointment: (appointmentId: string) =>
    apiRequest<{ appointment: Appointment; token: Token }>(`/appointments/${appointmentId}/check-in`, 'POST'),

  bookAppointment: (data: Partial<Appointment>) =>
    apiRequest<Appointment>('/appointments', 'POST', data),
};
