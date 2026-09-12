import { Consent, BreakGlassLog } from '../../models/Consent';

export class ConsentService {
  async createConsent(patientId: string, data: any) {
    const consent = new Consent({ ...data, patientId, isGranted: true });
    await consent.save();
    return consent;
  }

  async getConsents(patientId: string) {
    return Consent.find({ patientId }).populate('grantedToFacilityId').populate('grantedToDoctorId');
  }

  async getConsentById(id: string) {
    return Consent.findById(id).populate('grantedToFacilityId').populate('grantedToDoctorId');
  }

  async updateConsent(id: string, data: any) {
    return Consent.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteConsent(id: string) {
    return Consent.findByIdAndDelete(id);
  }

  async setGrantStatus(id: string, isGranted: boolean) {
    return Consent.findByIdAndUpdate(id, { isGranted }, { new: true });
  }

  async triggerBreakGlass(patientId: string, userId: string, facilityId: string, reason: string) {
    const log = new BreakGlassLog({
      patientId,
      accessedByUserId: userId,
      facilityId,
      reason,
      accessedAt: new Date(),
    });
    await log.save();
    return log;
  }

  async getBreakGlassLog(id: string) {
    return BreakGlassLog.findById(id).populate('accessedByUserId').populate('facilityId');
  }

  async getAccessHistory(patientId: string) {
    return BreakGlassLog.find({ patientId }).populate('accessedByUserId').populate('facilityId').sort({ accessedAt: -1 });
  }
}
