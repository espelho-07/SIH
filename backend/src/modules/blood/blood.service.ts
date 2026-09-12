import { BloodRepository } from './blood.repository';
import { EmergencyBloodQuery, CreateBloodInventoryInput, UpdateBloodInventoryInput } from './blood.schema';
import { calculateHaversineDistance } from '../../utils/distance';
import { Hospital } from '../../models/Hospital';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { BloodGroup } from '../../models/BloodInventory';

export class BloodService {
  private repository: BloodRepository;

  constructor() {
    this.repository = new BloodRepository();
  }

  async findEmergencyBlood(query: EmergencyBloodQuery) {
    const { bloodGroup, latitude, longitude, radius } = query;

    const inventories = await this.repository.findEmergencyBlood(bloodGroup as BloodGroup);

    const validResults = inventories
      .filter((item: any) => item.hospitalId && item.hospitalId.isActive)
      .map((item: any) => {
        const hosp = item.hospitalId;
        const distanceKm = calculateHaversineDistance(latitude, longitude, hosp.latitude, hosp.longitude);

        return {
          hospitalId: hosp._id.toString(),
          hospitalName: hosp.name,
          hospitalType: hosp.type,
          address: hosp.address,
          district: hosp.district,
          state: hosp.state,
          phone: hosp.phone,
          emergencyAvailable: hosp.emergencyAvailable,
          bloodGroup: item.bloodGroup,
          availableUnits: item.availableUnits,
          status: item.status,
          distanceKm,
          lastUpdated: item.lastUpdated || item.updatedAt,
          location: {
            latitude: hosp.latitude,
            longitude: hosp.longitude,
          },
        };
      })
      .filter((h) => h.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return validResults;
  }

  async getHospitalInventory(hospitalId: string) {
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) {
      throw new NotFoundError(`Hospital with ID '${hospitalId}' not found`, 'HOSPITAL_NOT_FOUND');
    }

    const inventory = await this.repository.getHospitalInventory(hospitalId);
    return {
      hospitalId,
      hospitalName: hospital.name,
      inventory,
    };
  }

  async upsertBloodGroup(hospitalId: string, input: CreateBloodInventoryInput) {
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) {
      throw new NotFoundError(`Hospital with ID '${hospitalId}' not found`, 'HOSPITAL_NOT_FOUND');
    }

    const updated = await this.repository.upsertBloodGroup(
      hospitalId,
      input.bloodGroup as BloodGroup,
      input.availableUnits,
      input.status
    );

    return updated;
  }

  async updateBloodGroup(hospitalId: string, bloodGroup: string, input: UpdateBloodInventoryInput) {
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) {
      throw new NotFoundError(`Hospital with ID '${hospitalId}' not found`, 'HOSPITAL_NOT_FOUND');
    }

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const formattedGroup = bloodGroup.toUpperCase();
    if (!validGroups.includes(formattedGroup)) {
      throw new BadRequestError(`Invalid blood group '${bloodGroup}'`, 'INVALID_BLOOD_GROUP');
    }

    const updated = await this.repository.updateUnitsAndStatus(
      hospitalId,
      formattedGroup,
      input.availableUnits,
      input.status
    );

    if (!updated) {
      // If not existing yet, create it
      return await this.repository.upsertBloodGroup(
        hospitalId,
        formattedGroup as BloodGroup,
        input.availableUnits,
        input.status
      );
    }

    return updated;
  }

  async deleteBloodInventory(hospitalId: string, bloodGroup: string) {
    const { BloodInventory } = require('../../models/BloodInventory');
    return BloodInventory.findOneAndDelete({ hospitalId, bloodGroup: bloodGroup.toUpperCase() });
  }
}
