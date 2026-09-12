import { apiRequest } from './client';
import { SystemHealthOverview, PermissionMatrixItem, AiModelRegistryItem, AuditLog } from '@/types/admin';
import { User } from '@/types/auth';

export const adminApi = {
  getSystemHealth: () =>
    apiRequest<SystemHealthOverview>('/super-admin/system-health', 'GET'),

  getUsers: () =>
    apiRequest<User[]>('/super-admin/users', 'GET'),

  createUser: (data: Partial<User>) =>
    apiRequest<User>('/super-admin/users', 'POST', data),

  getPermissions: () =>
    apiRequest<PermissionMatrixItem[]>('/super-admin/roles', 'GET'),

  getAiModels: () =>
    apiRequest<AiModelRegistryItem[]>('/super-admin/ai-models', 'GET'),

  deployModel: (modelId: string) =>
    apiRequest<{ deployed: boolean }>(`/super-admin/ai-models/${modelId}/deploy`, 'POST'),

  rollbackModel: (modelId: string) =>
    apiRequest<{ rolledBack: boolean }>(`/super-admin/ai-models/${modelId}/rollback`, 'POST'),

  getAuditLogs: (params?: { action?: string; role?: string }) =>
    apiRequest<AuditLog[]>('/super-admin/audit', 'GET', params),
};
