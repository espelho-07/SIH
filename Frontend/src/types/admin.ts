export interface SystemHealthService {
  name: string; // "Express API", "MongoDB Primary", "ML Inference API", "Socket.IO Realtime", "Object Storage"
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  details?: string;
}

export interface SystemHealthOverview {
  overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  services: SystemHealthService[];
  activeUsersCount: number;
  openSocketConnections: number;
  totalErrorsLast24h: number;
  queuedBackgroundJobs: number;
}

export interface PermissionMatrixItem {
  module: 'PATIENTS' | 'APPOINTMENTS' | 'QUEUE' | 'EHR' | 'REFERRALS' | 'RESOURCES' | 'AI_INSIGHTS' | 'SYSTEM_CONFIG';
  patient: { read: boolean; write: boolean; create: boolean; delete: boolean };
  asha: { read: boolean; write: boolean; create: boolean; delete: boolean };
  doctor: { read: boolean; write: boolean; create: boolean; delete: boolean };
  staff: { read: boolean; write: boolean; create: boolean; delete: boolean };
  districtAdmin: { read: boolean; write: boolean; create: boolean; delete: boolean };
  superAdmin: { read: boolean; write: boolean; create: boolean; delete: boolean };
}

export interface AiModelRegistryItem {
  id: string;
  modelName: string; // e.g. "DiseaseSurge-LSTM-v2.1", "SpecialistDemand-RF-v1.4", "BedOccupancy-Prophet-v3.0"
  targetMetric: string;
  algorithm: string;
  version: string;
  accuracyPercent?: number;
  mae?: number;
  rmse?: number;
  status: 'ACTIVE' | 'STAGING' | 'ARCHIVED' | 'TRAINING';
  deployedAt?: string;
  trainedOnRecords: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string; // e.g. "ACCESS_EHR_RECORD", "DISPENSE_NARCOTIC_DRUG", "UPDATE_BED_QUOTA", "DEPLOY_ML_MODEL"
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: string;
}
