import { HospitalService as HospitalServiceClass } from '../hospital/hospital.service';
import { DoctorService } from '../doctor/doctor.service';
import { MedicineService } from '../medicine/medicine.service';
import { HospitalService as HospitalServiceModel } from '../../models/HospitalService';
import { redisCache } from '../../config/redis';

export class AdminService {
  private hospitalService: HospitalServiceClass;
  private doctorService: DoctorService;
  private medicineService: MedicineService;

  constructor() {
    this.hospitalService = new HospitalServiceClass();
    this.doctorService = new DoctorService();
    this.medicineService = new MedicineService();
  }

  // Hospitals
  async createHospital(data: any) {
    return this.hospitalService.createHospital(data);
  }

  async updateHospital(id: string, data: any) {
    return this.hospitalService.updateHospital(id, data);
  }

  async deleteHospital(id: string) {
    return this.hospitalService.deleteHospital(id);
  }

  // Doctors
  async createDoctor(data: any) {
    return this.doctorService.createDoctor(data);
  }

  async updateDoctor(id: string, data: any) {
    return this.doctorService.updateDoctor(id, data);
  }

  async deleteDoctor(id: string) {
    return this.doctorService.deleteDoctor(id);
  }

  // Medicines
  async createMedicine(data: any) {
    return this.medicineService.createMedicine(data);
  }

  async updateMedicine(id: string, data: any) {
    return this.medicineService.updateMedicine(id, data);
  }

  async deleteMedicine(id: string) {
    return this.medicineService.deleteMedicine(id);
  }

  // Services
  async addHospitalService(hospitalId: string, data: { serviceName: string; isAvailable?: boolean; description?: string }) {
    await this.hospitalService.getHospitalById(hospitalId);
    const service = await HospitalServiceModel.create({
      hospitalId,
      serviceName: data.serviceName,
      isAvailable: data.isAvailable ?? true,
      description: data.description,
    });
    await redisCache.flush();
    return service;
  }

  async updateHospitalService(serviceId: string, data: { serviceName?: string; isAvailable?: boolean; description?: string }) {
    const service = await HospitalServiceModel.findByIdAndUpdate(serviceId, data, { new: true });
    await redisCache.flush();
    return service;
  }

  // Stock update
  async updateMedicineStock(hospitalId: string, medicineId: string, input: { quantity: number; availabilityStatus: any }) {
    return this.medicineService.updateHospitalStock(hospitalId, medicineId, input);
  }
}
