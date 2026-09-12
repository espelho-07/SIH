import { Bed, BedStatus } from '../../models/Bed';

export class BedService {
  async getBeds(query: any) {
    const filter: any = {};
    if (query.hospitalId || query.facilityId) filter.hospitalId = query.hospitalId || query.facilityId;
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    return Bed.find(filter).populate('hospitalId').populate('patientId');
  }

  async getBedById(id: string) {
    return Bed.findById(id).populate('hospitalId').populate('patientId');
  }

  async createBed(data: any) {
    const bed = new Bed(data);
    await bed.save();
    return bed;
  }

  async updateBed(id: string, data: any) {
    return Bed.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteBed(id: string) {
    return Bed.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: BedStatus, patientId?: string) {
    const update: any = { status, lastUpdated: new Date() };
    if (patientId) update.patientId = patientId;
    if (status === 'AVAILABLE') update.patientId = null;
    return Bed.findByIdAndUpdate(id, update, { new: true });
  }

  async getBedSummary(facilityId: string) {
    const beds = await Bed.find({ hospitalId: facilityId });
    const summary: Record<string, { total: number; available: number; occupied: number }> = {
      GENERAL: { total: 0, available: 0, occupied: 0 },
      ICU: { total: 0, available: 0, occupied: 0 },
      ISOLATION: { total: 0, available: 0, occupied: 0 },
      MATERNITY: { total: 0, available: 0, occupied: 0 },
      EMERGENCY: { total: 0, available: 0, occupied: 0 },
    };

    beds.forEach((b) => {
      if (!summary[b.type]) summary[b.type] = { total: 0, available: 0, occupied: 0 };
      summary[b.type].total += 1;
      if (b.status === 'AVAILABLE') summary[b.type].available += 1;
      if (b.status === 'OCCUPIED') summary[b.type].occupied += 1;
    });

    return summary;
  }
}
