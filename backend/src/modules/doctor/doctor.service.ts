import { DoctorRepository } from './doctor.repository';
import { DoctorQuery, CreateDoctorInput, UpdateDoctorInput } from './doctor.schema';
import { NotFoundError } from '../../utils/errors';
import { redisCache } from '../../config/redis';
import { DoctorRoster } from '../../models/DoctorRoster';
import { Doctor } from '../../models/Doctor';

export class DoctorService {
  private repository: DoctorRepository;

  constructor() {
    this.repository = new DoctorRepository();
  }

  async getAllDoctors(query: DoctorQuery) {
    const cacheKey = `doctors:all:${JSON.stringify(query)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const doctors = await this.repository.findAll(query);
    await redisCache.set(cacheKey, JSON.stringify(doctors), 300);
    return doctors;
  }

  async getAvailableDoctors(query: DoctorQuery) {
    return this.getAllDoctors({
      ...query,
      availabilityStatus: 'AVAILABLE',
    });
  }

  async getDoctorById(id: string) {
    const doctor = await this.repository.findById(id);
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${id}' not found`);
    }
    return doctor;
  }

  async getDoctorByUserId(userId: string) {
    return Doctor.findOne({ phone: { $exists: true } }); // Fallback or matching profile
  }

  async updateDoctorAvailability(doctorId: string, status: string) {
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { availabilityStatus: status }, { new: true });
    await redisCache.flush();
    return doctor;
  }

  async createDoctor(data: CreateDoctorInput) {
    const doctor = await this.repository.create(data);
    await redisCache.flush();
    return doctor;
  }

  async updateDoctor(id: string, data: UpdateDoctorInput) {
    await this.getDoctorById(id);
    const updated = await this.repository.update(id, data);
    await redisCache.flush();
    return updated;
  }

  async deleteDoctor(id: string) {
    await this.getDoctorById(id);
    await this.repository.delete(id);
    await redisCache.flush();
  }

  // Doctor Shift Roster Methods
  async getRosters(query: any) {
    const filter: any = {};
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.status) filter.status = query.status;
    return DoctorRoster.find(filter).populate('doctorId').populate('hospitalId').sort({ shiftDate: 1 });
  }

  async getRosterById(id: string) {
    return DoctorRoster.findById(id).populate('doctorId').populate('hospitalId');
  }

  async createRoster(data: any) {
    const roster = new DoctorRoster(data);
    await roster.save();
    return roster;
  }

  async updateRoster(id: string, data: any) {
    return DoctorRoster.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRoster(id: string) {
    return DoctorRoster.findByIdAndDelete(id);
  }
}
