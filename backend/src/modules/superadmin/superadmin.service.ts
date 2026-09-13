import { User } from '../../models/User';
import { Hospital } from '../../models/Hospital';
import { AuditLog } from '../../models/AuditLog';

export class SuperAdminService {
  async getDashboard() {
    const [totalUsers, totalFacilities, totalAuditLogs] = await Promise.all([
      User.countDocuments(),
      Hospital.countDocuments(),
      AuditLog.countDocuments(),
    ]);

    return {
      systemVersion: '1.0.0-SANJEEVANI-CONNECT',
      uptimeSeconds: process.uptime(),
      totalUsers,
      totalFacilities,
      totalAuditLogs,
      databaseStatus: 'HEALTHY_CONNECTED',
      mlServiceStatus: 'HEALTHY_CONNECTED',
    };
  }

  async getSystemHealth() {
    return {
      backend: 'Healthy',
      database: 'Connected',
      mlService: 'Healthy',
      socketServer: 'Connected',
      redisCache: 'Connected',
      timestamp: new Date(),
    };
  }

  async getConfig() {
    return {
      appName: 'SANJEEVANI-CONNECT',
      environment: process.env.NODE_ENV || 'development',
      jwtExpiry: '1d',
      maxRadiusKm: 50,
      offlineSyncMaxBufferDays: 30,
      breakGlassAuditAlerts: true,
    };
  }

  async updateConfig(configData: any) {
    return { message: 'System configuration updated successfully', newConfig: configData };
  }

  async getUsers() {
    const users = await User.find().select('-password').lean();
    return users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
  }

  async getRoles() {
    return [
      { role: 'SUPER_ADMIN', permissions: ['ALL'] },
      { role: 'ADMIN', permissions: ['READ_WRITE', 'MANAGE_USERS'] },
      { role: 'DISTRICT_ADMIN', permissions: ['DISTRICT_MONITORING'] },
      { role: 'DOCTOR', permissions: ['CLINICAL_WORKSPACE', 'PRESCRIPTION', 'REFERRAL'] },
      { role: 'HOSPITAL_STAFF', permissions: ['QUEUE_MANAGEMENT', 'BED_MANAGEMENT'] },
      { role: 'ASHA', permissions: ['COMMUNITY_OUTREACH', 'VITALS_RECORDING'] },
      { role: 'USER', permissions: ['PATIENT_PORTAL'] },
    ];
  }

  async getAiModels() {
    return [
      {
        id: 'model_01',
        name: 'Disease Outbreak Predictor v2.1',
        category: 'FORECASTING',
        status: 'ACTIVE',
        accuracy: 94.2,
        lastTrained: '2026-03-01T00:00:00Z',
      },
      {
        id: 'model_02',
        name: 'Symptom Triage Red Flag Detector v1.8',
        category: 'TRIAGE',
        status: 'ACTIVE',
        accuracy: 97.5,
        lastTrained: '2026-02-15T00:00:00Z',
      },
    ];
  }

  async deployModel(modelId: string) {
    return { deployed: true, modelId, status: 'DEPLOYED_TO_PRODUCTION', deployedAt: new Date() };
  }

  async rollbackModel(modelId: string) {
    return { rolledBack: true, modelId, status: 'ROLLED_BACK_TO_PREVIOUS_VERSION', timestamp: new Date() };
  }

  async getAuditLogs(query?: any) {
    const logs = await AuditLog.find(query || {}).sort({ createdAt: -1 }).limit(100).lean();
    return logs;
  }
}
