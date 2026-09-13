import { AuditLog } from '../../models/AuditLog';

export class AuditService {
  async getAuditLogs(query: any) {
    const filter: any = {};
    if (query.action) filter.action = query.action;
    if (query.actorId) filter.actorId = query.actorId;
    if (query.targetPatientId) filter.targetPatientId = query.targetPatientId;
    if (query.facilityId) filter.facilityId = query.facilityId;
    return AuditLog.find(filter).populate('actorId').populate('targetPatientId').sort({ timestamp: -1 }).limit(100);
  }

  async getAuditLogById(id: string) {
    return AuditLog.findById(id).populate('actorId').populate('targetPatientId');
  }

  async getLogsByPatient(patientId: string) {
    return AuditLog.find({ targetPatientId: patientId }).populate('actorId').sort({ timestamp: -1 });
  }

  async getLogsByUser(userId: string) {
    return AuditLog.find({ actorId: userId }).sort({ timestamp: -1 });
  }

  async getLogsByFacility(facilityId: string) {
    return AuditLog.find({ facilityId }).sort({ timestamp: -1 });
  }
}
