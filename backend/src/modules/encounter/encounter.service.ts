import { Encounter } from '../../models/Encounter';
import { Patient } from '../../models/Patient';

export class EncounterService {
  async createEncounter(data: any) {
    const encounter = new Encounter(data);
    await encounter.save();
    return encounter;
  }

  async getAllEncounters(query: any = {}) {
    const filter: any = {};
    if (query.patientId) filter.patientId = query.patientId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.status) filter.status = query.status;
    return Encounter.find(filter).populate('patientId').populate('doctorId').populate('hospitalId').sort({ createdAt: -1 });
  }

  async getEncounterById(id: string) {
    return Encounter.findById(id).populate('patientId').populate('doctorId').populate('hospitalId');
  }

  async updateEncounter(id: string, data: any) {
    return Encounter.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteEncounter(id: string) {
    return Encounter.findByIdAndDelete(id);
  }

  async completeEncounter(id: string) {
    return Encounter.findByIdAndUpdate(id, { status: 'COMPLETED' }, { new: true });
  }

  async getDoctorEncounters(doctorId: string) {
    return Encounter.find({ doctorId }).populate('patientId').sort({ createdAt: -1 });
  }

  async getPatientEncounters(patientId: string) {
    return Encounter.find({ patientId }).populate('doctorId').populate('hospitalId').sort({ createdAt: -1 });
  }

  // Vitals
  async addVitals(encounterId: string, vitalsData: any) {
    const encounter = await Encounter.findByIdAndUpdate(
      encounterId,
      { $set: { vitals: vitalsData } },
      { new: true }
    );
    return encounter?.vitals;
  }

  async getEncounterVitals(encounterId: string) {
    const encounter = await Encounter.findById(encounterId);
    return encounter?.vitals;
  }

  async getPatientVitals(patientId: string) {
    const encounters = await Encounter.find({ patientId, vitals: { $exists: true } }).select('vitals createdAt');
    return encounters.map((e) => ({ timestamp: e.createdAt, vitals: e.vitals }));
  }

  // Diagnoses
  async addDiagnosis(encounterId: string, diagnosisData: any) {
    return Encounter.findByIdAndUpdate(
      encounterId,
      { $push: { diagnoses: diagnosisData } },
      { new: true }
    );
  }

  async getEncounterDiagnoses(encounterId: string) {
    const encounter = await Encounter.findById(encounterId);
    return encounter?.diagnoses || [];
  }

  // Prescriptions
  async addPrescription(encounterId: string, prescriptionData: any) {
    return Encounter.findByIdAndUpdate(
      encounterId,
      { $push: { prescriptions: prescriptionData } },
      { new: true }
    );
  }

  async getPendingPharmacyPrescriptions() {
    const encounters = await Encounter.find({ 'prescriptions.isDispensed': false })
      .populate('patientId')
      .populate('doctorId');
    return encounters;
  }

  async dispensePrescription(encounterId: string, medicineIndex: number) {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter || !encounter.prescriptions) return null;
    encounter.prescriptions[medicineIndex].isDispensed = true;
    await encounter.save();
    return encounter.prescriptions[medicineIndex];
  }

  // Diagnostics
  async addDiagnosticOrder(encounterId: string, orderData: any) {
    return Encounter.findByIdAndUpdate(
      encounterId,
      { $push: { diagnostics: orderData } },
      { new: true }
    );
  }

  async getDiagnosticOrders() {
    return Encounter.find({ 'diagnostics.0': { $exists: true } }).populate('patientId').populate('doctorId');
  }

  async updateDiagnosticStatus(encounterId: string, testIndex: number, status: string, reportUrl?: string) {
    const encounter = await Encounter.findById(encounterId);
    if (!encounter || !encounter.diagnostics) return null;
    encounter.diagnostics[testIndex].status = status as any;
    if (reportUrl) encounter.diagnostics[testIndex].reportUrl = reportUrl;
    await encounter.save();
    return encounter.diagnostics[testIndex];
  }
}
