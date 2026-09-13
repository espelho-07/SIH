import { Patient } from '../../models/Patient';

export class PatientService {
  async getPatientByUserId(userId: string) {
    let patient = await Patient.findOne({ userId });
    if (!patient) {
      // Auto-create basic patient profile if missing
      patient = new Patient({ userId, name: 'Citizen Patient', phone: '0000000000', gender: 'OTHER', address: { district: 'Default', state: 'Default', pincode: '000000' } });
      await patient.save();
    }
    return patient;
  }

  async updatePatientByUserId(userId: string, data: any) {
    return Patient.findOneAndUpdate({ userId }, data, { new: true, upsert: true });
  }

  async getPatientById(patientId: string) {
    return Patient.findById(patientId);
  }

  async updatePatientById(patientId: string, data: any) {
    return Patient.findByIdAndUpdate(patientId, data, { new: true });
  }

  async deletePatientById(patientId: string) {
    return Patient.findByIdAndDelete(patientId);
  }

  async registerPatient(data: any) {
    const patient = new Patient(data);
    await patient.save();
    return patient;
  }

  async getAllPatients(query: any) {
    const { district, state, village, search, isHighRisk, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (district) filter['address.district'] = district;
    if (state) filter['address.state'] = state;
    if (village) filter['address.village'] = village;
    if (isHighRisk !== undefined) filter.isHighRisk = isHighRisk === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { abhaId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const patients = await Patient.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Patient.countDocuments(filter);
    return { patients, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  async searchPatients(q: string) {
    return Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { abhaId: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);
  }
}
