import { Hospital } from '../../models/Hospital';
import { Doctor } from '../../models/Doctor';
import { Equipment } from '../../models/Equipment';
import { Department } from '../../models/Department';

export class SearchService {
  async unifiedSearch(q: string) {
    if (!q) return { facilities: [], doctors: [], specialties: [], equipment: [] };

    const regex = new RegExp(q, 'i');
    const [facilities, doctors, specialties, equipment] = await Promise.all([
      Hospital.find({ $or: [{ name: regex }, { district: regex }, { state: regex }] }).limit(10),
      Doctor.find({ $or: [{ name: regex }, { specialization: regex }] }).limit(10),
      Department.find({ name: regex }).limit(10),
      Equipment.find({ name: regex }).limit(10),
    ]);

    return {
      facilities,
      doctors,
      specialties,
      equipment,
    };
  }

  async searchFacilities(q: string) {
    const regex = new RegExp(q, 'i');
    return Hospital.find({ $or: [{ name: regex }, { district: regex }, { address: regex }] }).limit(20);
  }

  async searchDoctors(q: string) {
    const regex = new RegExp(q, 'i');
    return Doctor.find({ $or: [{ name: regex }, { specialization: regex }] }).limit(20);
  }

  async searchEquipment(q: string) {
    const regex = new RegExp(q, 'i');
    return Equipment.find({ name: regex }).populate('hospitalId').limit(20);
  }
}
