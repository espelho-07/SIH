import mongoose from 'mongoose';
import { BloodInventory, IBloodInventory, BloodGroup, BloodAvailabilityStatus } from '../../models/BloodInventory';

export class BloodRepository {
  async findEmergencyBlood(bloodGroup: BloodGroup) {
    return await BloodInventory.find({
      bloodGroup,
      availableUnits: { $gt: 0 },
      status: { $ne: 'OUT_OF_STOCK' },
    })
      .populate({
        path: 'hospitalId',
        match: { isActive: true },
        select: 'name type address district state pincode latitude longitude phone email emergencyAvailable isActive',
      })
      .lean();
  }

  async getHospitalInventory(hospitalId: string) {
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) return [];

    return await BloodInventory.find({ hospitalId: new mongoose.Types.ObjectId(hospitalId) })
      .sort({ bloodGroup: 1 })
      .lean();
  }

  async upsertBloodGroup(
    hospitalId: string,
    bloodGroup: BloodGroup,
    availableUnits: number,
    status?: BloodAvailabilityStatus
  ): Promise<any> {
    const computedStatus =
      status || (availableUnits === 0 ? 'OUT_OF_STOCK' : availableUnits < 5 ? 'LIMITED' : 'AVAILABLE');

    const filter: any = {
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      bloodGroup,
    };

    const update: any = {
      availableUnits,
      status: computedStatus,
      lastUpdated: new Date(),
    };

    const updated = await BloodInventory.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }).lean();

    return updated;
  }

  async updateUnitsAndStatus(
    hospitalId: string,
    bloodGroup: string,
    availableUnits: number,
    status?: BloodAvailabilityStatus
  ): Promise<any> {
    const computedStatus =
      status || (availableUnits === 0 ? 'OUT_OF_STOCK' : availableUnits < 5 ? 'LIMITED' : 'AVAILABLE');

    const filter: any = {
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      bloodGroup,
    };

    const update: any = {
      availableUnits,
      status: computedStatus,
      lastUpdated: new Date(),
    };

    const updated = await BloodInventory.findOneAndUpdate(filter, update, { new: true }).lean();

    return updated;
  }
}
