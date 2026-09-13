import { Referral, ReferralStatus } from '../../models/Referral';
import { Hospital } from '../../models/Hospital';

export class ReferralService {
  async createReferral(data: any, doctorId: string) {
    const referral = new Referral({
      ...data,
      referringDoctorId: doctorId,
      status: 'PENDING',
      timeline: [
        {
          status: 'PENDING',
          updatedBy: doctorId,
          timestamp: new Date(),
          note: 'Referral created by referring doctor',
        },
      ],
    });
    await referral.save();
    return referral;
  }

  async getReferrals(query: any) {
    const filter: any = {};
    if (query.patientId) filter.patientId = query.patientId;
    if (query.referringFacilityId) filter.referringFacilityId = query.referringFacilityId;
    if (query.receivingFacilityId) filter.receivingFacilityId = query.receivingFacilityId;
    if (query.status) filter.status = query.status;
    if (query.urgency) filter.urgency = query.urgency;

    return Referral.find(filter)
      .populate('patientId')
      .populate('referringDoctorId')
      .populate('referringFacilityId')
      .populate('receivingFacilityId')
      .sort({ createdAt: -1 });
  }

  async getReferralById(id: string) {
    return Referral.findById(id)
      .populate('patientId')
      .populate('referringDoctorId')
      .populate('referringFacilityId')
      .populate('receivingFacilityId');
  }

  async updateReferral(id: string, data: any) {
    return Referral.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteReferral(id: string) {
    return Referral.findByIdAndDelete(id);
  }

  async getIncomingReferrals(facilityId: string) {
    return Referral.find({ receivingFacilityId: facilityId })
      .populate('patientId')
      .populate('referringDoctorId')
      .populate('referringFacilityId')
      .sort({ createdAt: -1 });
  }

  async updateStatus(id: string, newStatus: ReferralStatus, userId: string, note?: string, extraFields: any = {}) {
    const referral = await Referral.findById(id);
    if (!referral) return null;

    referral.status = newStatus;
    Object.assign(referral, extraFields);
    referral.timeline.push({
      status: newStatus,
      updatedBy: userId as any,
      timestamp: new Date(),
      note,
    });
    await referral.save();
    return referral;
  }

  async reroute(id: string, newFacilityId: string, userId: string, reason?: string) {
    const referral = await Referral.findById(id);
    if (!referral) return null;

    if (!referral.rerouteHistory) {
      referral.rerouteHistory = [];
    }

    referral.rerouteHistory.push({
      previousFacilityId: referral.receivingFacilityId,
      reroutedAt: new Date(),
      reason,
    });
    referral.receivingFacilityId = newFacilityId as any;
    referral.status = 'REROUTED';
    referral.timeline.push({
      status: 'REROUTED',
      updatedBy: userId as any,
      timestamp: new Date(),
      note: `Rerouted to facility ${newFacilityId}. Reason: ${reason || 'Capacity/SLA fallback'}`,
    });
    await referral.save();
    return referral;
  }

  async autoReroute(id: string, userId: string) {
    const referral = await Referral.findById(id);
    if (!referral) return null;

    const nearbyHospitals = await Hospital.find({
      _id: { $ne: referral.receivingFacilityId },
      isActive: true,
    }).limit(1);

    if (nearbyHospitals.length > 0) {
      return this.reroute(id, nearbyHospitals[0]._id.toString(), userId, 'Automatic SLA breach reroute');
    }
    return referral;
  }

  async getTimelineEvents(id: string) {
    const referral = await Referral.findById(id).select('timeline status');
    return referral?.timeline || [];
  }
}
