import { MedicineRepository } from './medicine.repository';
import { MedicineQuery, MedicineAvailabilityQuery, CreateMedicineInput, UpdateMedicineInput, UpdateStockInput } from './medicine.schema';
import { calculateHaversineDistance } from '../../utils/distance';
import { NotFoundError } from '../../utils/errors';
import { redisCache } from '../../config/redis';

export class MedicineService {
  private repository: MedicineRepository;

  constructor() {
    this.repository = new MedicineRepository();
  }

  async getAllMedicines(query: MedicineQuery) {
    const cacheKey = `medicines:all:${JSON.stringify(query)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const medicines = await this.repository.findAll(query);
    await redisCache.set(cacheKey, JSON.stringify(medicines), 300);
    return medicines;
  }

  async getMedicineById(id: string) {
    const medicine = await this.repository.findById(id);
    if (!medicine) {
      throw new NotFoundError(`Medicine with ID '${id}' not found`);
    }
    return medicine;
  }

  async getMedicineLocationAvailability(medicineId: string, query: MedicineAvailabilityQuery) {
    const { latitude, longitude, radius } = query;

    const medicine = await this.getMedicineById(medicineId);
    const stocks = await this.repository.findMedicineAvailabilityInHospitals(medicineId);

    const facilities = stocks
      .map((stock) => {
        const distanceKm = calculateHaversineDistance(
          latitude,
          longitude,
          stock.hospital.latitude,
          stock.hospital.longitude
        );

        return {
          hospitalId: stock.hospital.id,
          hospitalName: stock.hospital.name,
          hospitalType: stock.hospital.type,
          address: stock.hospital.address,
          district: stock.hospital.district,
          phone: stock.hospital.phone,
          emergencyAvailable: stock.hospital.emergencyAvailable,
          latitude: stock.hospital.latitude,
          longitude: stock.hospital.longitude,
          distanceKm,
          quantity: stock.quantity,
          availabilityStatus: stock.availabilityStatus,
          lastUpdated: stock.lastUpdated,
        };
      })
      .filter((fac) => fac.distanceKm <= radius && fac.availabilityStatus !== 'OUT_OF_STOCK')
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      medicine: {
        id: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        category: medicine.category,
        unit: medicine.unit,
      },
      searchCenter: { latitude, longitude, radiusKm: radius },
      totalAvailableFacilities: facilities.length,
      facilities,
    };
  }

  async createMedicine(data: CreateMedicineInput) {
    const medicine = await this.repository.create(data);
    await redisCache.flush();
    return medicine;
  }

  async updateMedicine(id: string, data: UpdateMedicineInput) {
    await this.getMedicineById(id);
    const updated = await this.repository.update(id, data);
    await redisCache.flush();
    return updated;
  }

  async deleteMedicine(id: string) {
    await this.getMedicineById(id);
    await this.repository.delete(id);
    await redisCache.flush();
  }

  async updateHospitalStock(hospitalId: string, medicineId: string, input: UpdateStockInput) {
    await this.getMedicineById(medicineId);
    const updatedStock = await this.repository.upsertHospitalStock(hospitalId, medicineId, input);
    await redisCache.flush();
    return updatedStock;
  }
}
