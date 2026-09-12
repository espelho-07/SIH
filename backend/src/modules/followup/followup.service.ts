import { Followup } from '../../models/Followup';
import { Referral } from '../../models/Referral';

export class FollowupService {
  async createFollowup(data: any) {
    const followup = new Followup(data);
    await followup.save();
    return followup;
  }

  async getFollowups(query: any) {
    const filter: any = {};
    if (query.patientId) filter.patientId = query.patientId;
    if (query.assignedAshaId) filter.assignedAshaId = query.assignedAshaId;
    if (query.status) filter.status = query.status;
    return Followup.find(filter)
      .populate('patientId')
      .populate('assignedAshaId')
      .populate('assignedDoctorId')
      .sort({ scheduledDate: 1 });
  }

  async getFollowupById(id: string) {
    return Followup.findById(id).populate('patientId').populate('assignedAshaId').populate('assignedDoctorId');
  }

  async updateFollowup(id: string, data: any) {
    return Followup.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteFollowup(id: string) {
    return Followup.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: string, notes?: string) {
    const update: any = { status };
    if (status === 'COMPLETED') update.completedAt = new Date();
    if (notes) update.completionNotes = notes;
    return Followup.findByIdAndUpdate(id, update, { new: true });
  }

  async reschedule(id: string, scheduledDate: Date) {
    return Followup.findByIdAndUpdate(id, { scheduledDate, status: 'RESCHEDULED' }, { new: true });
  }

  async createFromReferral(referralId: string, scheduledDate: Date, reason?: string) {
    const ref = await Referral.findById(referralId);
    if (!ref) return null;

    const followup = new Followup({
      patientId: ref.patientId,
      referralId: ref._id,
      scheduledDate,
      reason: reason || `Post-referral follow-up for ${ref.targetSpecialty}`,
      status: 'PENDING',
    });
    await followup.save();
    return followup;
  }
}
