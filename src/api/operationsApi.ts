import { apiRequest } from './client';
import {
  FacilityOperationsSummary,
  FacilityOperationalStatus,
  OperationalService,
  OperationalAnnouncement,
  OperationalIssue,
  StaffDutyItem,
} from '@/types/operations';

export const operationsApi = {
  // 1. Get facility operational summary and telemetry
  getSummary: (facilityId: string = 'fac_civil_01') =>
    apiRequest<FacilityOperationsSummary>('/operations', 'GET', { facilityId }),

  // 2. Update facility global operational status
  updateStatus: (
    status: FacilityOperationalStatus,
    reason?: string,
    updatedBy: string = 'Operations Coordinator'
  ) =>
    apiRequest<{
      status: FacilityOperationalStatus;
      reason?: string;
      updatedAt: string;
      updatedBy: string;
    }>('/operations/status', 'PATCH', { status, reason, updatedBy }),

  // 3. Operational Services
  getServices: () =>
    apiRequest<OperationalService[]>('/operations/services', 'GET'),

  updateServiceStatus: (
    serviceId: string,
    status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE',
    reason?: string,
    notes?: string
  ) =>
    apiRequest<OperationalService>(`/operations/services/${serviceId}`, 'PATCH', {
      status,
      reason,
      notes,
    }),

  // 4. Announcements & Bulletins
  getAnnouncements: () =>
    apiRequest<OperationalAnnouncement[]>('/operations/announcements', 'GET'),

  createAnnouncement: (
    title: string,
    message: string,
    severity: 'INFO' | 'WARNING' | 'URGENT' = 'INFO',
    author: string = 'Operations Coordinator'
  ) =>
    apiRequest<OperationalAnnouncement>('/operations/announcements', 'POST', {
      title,
      message,
      severity,
      author,
    }),

  // 5. Operational Issues & Triage
  getIssues: () =>
    apiRequest<OperationalIssue[]>('/operations/issues', 'GET'),

  resolveIssue: (issueId: string, resolvedBy: string = 'Operations Coordinator') =>
    apiRequest<OperationalIssue>(`/operations/issues/${issueId}/resolve`, 'PATCH', {
      resolvedBy,
    }),

  // 6. Staff Duty
  getStaffDuty: () =>
    apiRequest<StaffDutyItem[]>('/operations/staff-duty', 'GET'),

  // 7. Queue Delay Broadcast
  broadcastQueueDelay: (departmentId: string, delayMinutes: number) =>
    apiRequest<any>('/operations/queues/delay', 'POST', {
      departmentId,
      delayMinutes,
    }),
};