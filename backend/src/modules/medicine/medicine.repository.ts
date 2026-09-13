import { Medicine } from '../../models/Medicine';
import { HospitalMedicine } from '../../models/HospitalMedicine';
import { MedicineQuery, CreateMedicineInput, UpdateMedicineInput, UpdateStockInput } from './medicine.schema';

export class MedicineRepository {
  async findAll(query: MedicineQuery) {
    const filter: any = { isActive: true };

    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { genericName: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
      ];
    }

    const list = await Medicine.find(filter).sort({ name: 1 }).lean();

    return list.map((m: any) => ({
      id: m.medicineId || m._id.toString(),
      facilityId: m.facilityId || 'fac_civil_01',
      name: m.name,
      medicineName: m.medicineName || m.name,
      genericName: m.genericName,
      category: m.category,
      batchNumber: m.batchNumber || 'BATCH-2026',
      availableQuantity: m.availableQuantity ?? 100,
      minimumStockThreshold: m.minimumStockThreshold ?? 20,
      unit: m.unit || 'Tablets',
      expiryDate: m.expiryDate || '2026-12-31',
      status: m.status || 'IN_STOCK',
      quarantineReason: m.quarantineReason,
      description: m.description,
      lastUpdated: m.lastUpdated || (m.updatedAt ? m.updatedAt.toISOString() : new Date().toISOString()),
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }

  async findById(id: string) {
    const m = (await Medicine.findOne({
      $or: [
        { medicineId: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
      ],
    }).lean()) as any;
    if (!m) return null;

    return {
      id: m.medicineId || m._id.toString(),
      facilityId: m.facilityId || 'fac_civil_01',
      name: m.name,
      medicineName: m.medicineName || m.name,
      genericName: m.genericName,
      category: m.category,
      batchNumber: m.batchNumber || 'BATCH-2026',
      availableQuantity: m.availableQuantity ?? 100,
      minimumStockThreshold: m.minimumStockThreshold ?? 20,
      unit: m.unit || 'Tablets',
      expiryDate: m.expiryDate || '2026-12-31',
      status: m.status || 'IN_STOCK',
      quarantineReason: m.quarantineReason,
      description: m.description,
      lastUpdated: m.lastUpdated || (m.updatedAt ? m.updatedAt.toISOString() : new Date().toISOString()),
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  async findMedicineAvailabilityInHospitals(medicineId: string) {
    const stocks: any[] = await HospitalMedicine.find({ medicineId })
      .populate('hospitalId')
      .populate('medicineId')
      .lean();

    return stocks
      .filter((s) => s.hospitalId && s.hospitalId.isActive)
      .map((s) => ({
        id: s._id.toString(),
        hospital: {
          id: s.hospitalId._id.toString(),
          name: s.hospitalId.name,
          type: s.hospitalId.type,
          address: s.hospitalId.address,
          district: s.hospitalId.district,
          phone: s.hospitalId.phone,
          emergencyAvailable: s.hospitalId.emergencyAvailable,
          latitude: s.hospitalId.latitude,
          longitude: s.hospitalId.longitude,
        },
        medicine: s.medicineId,
        quantity: s.quantity,
        availabilityStatus: s.availabilityStatus,
        lastUpdated: s.lastUpdated,
      }));
  }

  async create(data: CreateMedicineInput) {
    const created = await Medicine.create(data);
    return {
      id: created._id.toString(),
      ...data,
    };
  }

  async update(id: string, data: UpdateMedicineInput) {
    const updated = await Medicine.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) return null;

    return {
      id: updated._id.toString(),
      ...updated,
    };
  }

  async delete(id: string) {
    await Promise.all([
      Medicine.findByIdAndDelete(id),
      HospitalMedicine.deleteMany({ medicineId: id }),
    ]);
  }

  async upsertHospitalStock(hospitalId: string, medicineId: string, input: UpdateStockInput) {
    const updated = await HospitalMedicine.findOneAndUpdate(
      { hospitalId, medicineId },
      {
        hospitalId,
        medicineId,
        quantity: input.quantity,
        availabilityStatus: input.availabilityStatus,
        lastUpdated: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    )
      .populate('hospitalId')
      .populate('medicineId')
      .lean();

    return updated;
  }
}
