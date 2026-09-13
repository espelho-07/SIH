import { Equipment } from '../../models/Equipment';

export class EquipmentService {
  async getEquipment(query: any) {
    const filter: any = {};
    if (query.hospitalId || query.facilityId) filter.hospitalId = query.hospitalId || query.facilityId;
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    return Equipment.find(filter).populate('hospitalId');
  }

  async getEquipmentById(id: string) {
    return Equipment.findById(id).populate('hospitalId');
  }

  async createEquipment(data: any) {
    const eq = new Equipment(data);
    await eq.save();
    return eq;
  }

  async updateEquipment(id: string, data: any) {
    return Equipment.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id: string, status: string, notes?: string) {
    return Equipment.findByIdAndUpdate(
      id,
      { status, notes, lastVerifiedAt: new Date() },
      { new: true }
    );
  }

  async deleteEquipment(id: string) {
    return Equipment.findByIdAndDelete(id);
  }
}
