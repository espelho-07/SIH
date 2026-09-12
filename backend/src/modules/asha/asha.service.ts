import { AshaVisit } from '../../models/AshaVisit';
import { Patient } from '../../models/Patient';
import { Followup } from '../../models/Followup';
import { User } from '../../models/User';

export class AshaService {
  async getDashboard(ashaId: string) {
    const totalPatients = await Patient.countDocuments({ assignedAshaId: ashaId });
    const highRiskPatients = await Patient.countDocuments({ assignedAshaId: ashaId, isHighRisk: true });
    const pendingVisits = await AshaVisit.countDocuments({ ashaId, status: 'PENDING' });
    const todayVisits = await AshaVisit.find({ ashaId, status: 'PENDING' }).populate('patientId').limit(10);
    const pendingFollowups = await Followup.countDocuments({ assignedAshaId: ashaId, status: 'PENDING' });

    return {
      totalPatients,
      highRiskPatients,
      pendingVisits,
      pendingFollowups,
      todayVisits,
    };
  }

  async getProfile(userId: string) {
    return User.findById(userId).select('-password');
  }

  async updateProfile(userId: string, data: any) {
    return User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  }

  async getAssignedPatients(ashaId: string, query: any) {
    const filter: any = { assignedAshaId: ashaId };
    if (query.isHighRisk !== undefined) filter.isHighRisk = query.isHighRisk === 'true';
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }
    return Patient.find(filter).sort({ name: 1 });
  }

  async getAssignedPatientById(ashaId: string, patientId: string) {
    return Patient.findOne({ _id: patientId, assignedAshaId: ashaId });
  }

  async createAssignedPatient(ashaId: string, data: any) {
    const patient = new Patient({ ...data, assignedAshaId: ashaId });
    await patient.save();
    return patient;
  }

  async updateAssignedPatient(ashaId: string, patientId: string, data: any) {
    return Patient.findOneAndUpdate({ _id: patientId, assignedAshaId: ashaId }, data, { new: true });
  }

  async createVisit(ashaId: string, data: any) {
    const visit = new AshaVisit({ ...data, ashaId });
    await visit.save();
    if (data.screeningResult?.riskLevel === 'HIGH') {
      await Patient.findByIdAndUpdate(data.patientId, { isHighRisk: true });
    }
    return visit;
  }

  async getVisits(ashaId: string) {
    return AshaVisit.find({ ashaId }).populate('patientId').sort({ visitDate: -1 });
  }

  async getVisitById(visitId: string) {
    return AshaVisit.findById(visitId).populate('patientId');
  }

  async updateVisit(visitId: string, data: any) {
    return AshaVisit.findByIdAndUpdate(visitId, data, { new: true });
  }

  async completeVisit(visitId: string) {
    return AshaVisit.findByIdAndUpdate(visitId, { status: 'COMPLETED' }, { new: true });
  }

  async deleteVisit(visitId: string) {
    return AshaVisit.findByIdAndDelete(visitId);
  }

  async createScreening(ashaId: string, data: any) {
    const visit = new AshaVisit({
      ashaId,
      patientId: data.patientId,
      visitType: 'SCREENING',
      screeningResult: {
        condition: data.condition,
        riskLevel: data.riskLevel,
        notes: data.notes,
      },
      status: 'COMPLETED',
    });
    await visit.save();
    if (data.riskLevel === 'HIGH') {
      await Patient.findByIdAndUpdate(data.patientId, { isHighRisk: true });
    }
    return visit;
  }

  async recordVitals(ashaId: string, patientId: string, vitalsData: any) {
    const visit = new AshaVisit({
      ashaId,
      patientId,
      visitType: 'ROUTINE',
      vitals: vitalsData,
      status: 'COMPLETED',
    });
    await visit.save();
    return visit;
  }

  async getPatientVitals(patientId: string) {
    return AshaVisit.find({ patientId, 'vitals.bpSystolic': { $exists: true } }).sort({ visitDate: -1 });
  }

  async getHighRiskWatchlist(ashaId: string) {
    return Patient.find({ assignedAshaId: ashaId, isHighRisk: true });
  }

  async acknowledgeHighRisk(patientId: string) {
    return Patient.findByIdAndUpdate(patientId, { isHighRisk: false }, { new: true });
  }

  async getFollowups(ashaId: string) {
    return Followup.find({ assignedAshaId: ashaId }).populate('patientId').sort({ scheduledDate: 1 });
  }

  async updateFollowupStatus(id: string, status: string, notes?: string) {
    const update: any = { status };
    if (status === 'COMPLETED') update.completedAt = new Date();
    if (notes) update.completionNotes = notes;
    return Followup.findByIdAndUpdate(id, update, { new: true });
  }

  async rescheduleFollowup(id: string, scheduledDate: string) {
    return Followup.findByIdAndUpdate(id, { scheduledDate, status: 'RESCHEDULED' }, { new: true });
  }
}
