import { HospitalRepository } from './hospital.repository';
import {
  HospitalQuery,
  NearbyHospitalQuery,
  NearbyTreatmentQuery,
  TreatmentCostQuery,
  CreateHospitalInput,
  UpdateHospitalInput,
} from './hospital.schema';
import { calculateHaversineDistance } from '../../utils/distance';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { redisCache } from '../../config/redis';
import { HospitalService as HospitalServiceModel } from '../../models/HospitalService';
import { Doctor } from '../../models/Doctor';
import { Hospital } from '../../models/Hospital';

export class HospitalService {
  private repository: HospitalRepository;

  constructor() {
    this.repository = new HospitalRepository();
  }

  async getAllHospitals(query: HospitalQuery) {
    const cacheKey = `hospitals:all:${JSON.stringify(query)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const hospitals = await this.repository.findAll(query);
    await redisCache.set(cacheKey, JSON.stringify(hospitals), 300);
    return hospitals;
  }

  async getNearbyHospitals(query: NearbyHospitalQuery) {
    const { latitude, longitude, radius, type, emergency, service } = query;

    const cacheKey = `hospitals:nearby:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${radius}:${type || 'all'}:${emergency || 'all'}:${service || 'all'}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const candidates = await this.repository.findAll({
      type,
      emergency,
      service,
    });

    const nearbyHospitals = candidates
      .map((hosp) => {
        const distanceKm = calculateHaversineDistance(latitude, longitude, hosp.latitude, hosp.longitude);
        const availableDoctors = hosp.doctors
          ? hosp.doctors.filter((d: any) => d.availabilityStatus === 'AVAILABLE').length
          : 0;

        return {
          id: hosp.id,
          name: hosp.name,
          type: hosp.type,
          address: hosp.address,
          district: hosp.district,
          state: hosp.state,
          pincode: hosp.pincode,
          latitude: hosp.latitude,
          longitude: hosp.longitude,
          phone: hosp.phone,
          openingTime: hosp.openingTime,
          closingTime: hosp.closingTime,
          emergencyAvailable: hosp.emergencyAvailable,
          distanceKm,
          availableServices: hosp.services ? hosp.services.map((s: any) => s.serviceName) : [],
          availableDoctorCount: availableDoctors,
        };
      })
      .filter((hosp) => hosp.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    await redisCache.set(cacheKey, JSON.stringify(nearbyHospitals), 180);
    return nearbyHospitals;
  }

  // Feature 7: Nearest Treatment-wise Hospital Search
  async getNearbyHospitalsByTreatment(query: NearbyTreatmentQuery) {
    const { latitude, longitude, treatment, radius } = query;

    const regex = new RegExp(treatment, 'i');

    const [matchingServices, matchingDoctors] = await Promise.all([
      HospitalServiceModel.find({ serviceName: regex, isAvailable: true }).select('hospitalId serviceName').lean(),
      Doctor.find({ specialization: regex, isActive: true }).select('hospitalId name specialization qualification phone consultationStart consultationEnd availabilityStatus').lean(),
    ]);

    const serviceHospIds = matchingServices.map((s) => s.hospitalId.toString());
    const doctorHospIds = matchingDoctors.map((d) => d.hospitalId.toString());
    const combinedHospIds = Array.from(new Set([...serviceHospIds, ...doctorHospIds]));

    if (combinedHospIds.length === 0) {
      return [];
    }

    const candidateHospitals = await Hospital.find({
      _id: { $in: combinedHospIds },
      isActive: true,
    }).lean();

    const doctorMap = new Map<string, any[]>();
    matchingDoctors.forEach((d) => {
      const hid = d.hospitalId.toString();
      if (!doctorMap.has(hid)) doctorMap.set(hid, []);
      doctorMap.get(hid)!.push({
        id: d._id.toString(),
        name: d.name,
        specialization: d.specialization,
        qualification: d.qualification,
        phone: d.phone,
        consultationStart: d.consultationStart,
        consultationEnd: d.consultationEnd,
        availabilityStatus: d.availabilityStatus,
      });
    });

    const results = candidateHospitals
      .map((hosp) => {
        const distanceKm = calculateHaversineDistance(latitude, longitude, hosp.latitude, hosp.longitude);
        const hid = hosp._id.toString();
        return {
          hospitalId: hid,
          hospitalName: hosp.name,
          type: hosp.type,
          address: hosp.address,
          district: hosp.district,
          state: hosp.state,
          phone: hosp.phone,
          emergencyAvailable: hosp.emergencyAvailable,
          treatment,
          distanceKm,
          location: {
            latitude: hosp.latitude,
            longitude: hosp.longitude,
          },
          availableDoctors: doctorMap.get(hid) || [],
        };
      })
      .filter((h) => h.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return results;
  }

  // Feature 8: Common Healthcare Cost Comparison
  async getTreatmentCosts(query: TreatmentCostQuery) {
    const { treatment, hospitalId, latitude, longitude } = query;

    const regex = new RegExp(treatment, 'i');
    const filter: any = { serviceName: regex, isAvailable: true };

    if (hospitalId) {
      filter.hospitalId = hospitalId;
    }

    const services = await HospitalServiceModel.find(filter)
      .populate('hospitalId', 'name type address district state latitude longitude phone emergencyAvailable')
      .lean();

    const results = services.map((s: any) => {
      const hosp = s.hospitalId;
      let distanceKm: number | null = null;
      if (
        latitude !== undefined &&
        longitude !== undefined &&
        hosp &&
        hosp.latitude !== undefined &&
        hosp.longitude !== undefined
      ) {
        distanceKm = calculateHaversineDistance(latitude, longitude, hosp.latitude, hosp.longitude);
      }

      const min =
        s.minCost !== undefined
          ? s.minCost
          : s.estimatedCost !== undefined
          ? Math.round(s.estimatedCost * 0.8)
          : 200;
      const max =
        s.maxCost !== undefined
          ? s.maxCost
          : s.estimatedCost !== undefined
          ? Math.round(s.estimatedCost * 1.2)
          : 500;
      const est = s.estimatedCost !== undefined ? s.estimatedCost : Math.round((min + max) / 2);

      return {
        hospitalId: hosp?._id?.toString() || hosp?.id || s.hospitalId?.toString(),
        hospitalName: hosp?.name || 'Unknown Hospital',
        hospitalType: hosp?.type,
        district: hosp?.district,
        treatment: s.serviceName,
        description: s.description || 'Estimated healthcare service cost',
        estimatedCost: est,
        costRange: {
          min,
          max,
          currency: s.currency || 'INR',
        },
        distanceKm,
        lastUpdated: s.updatedAt || s.createdAt || new Date(),
      };
    });

    if (latitude !== undefined && longitude !== undefined) {
      results.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    } else {
      results.sort((a, b) => a.estimatedCost - b.estimatedCost);
    }

    return results;
  }

  async getHospitalById(id: string) {
    const hospital = await this.repository.findById(id);
    if (!hospital) {
      throw new NotFoundError(`Hospital with ID '${id}' not found`);
    }
    return hospital;
  }

  async getHospitalCompleteDetails(id: string) {
    const details = await this.repository.findDetailedById(id);
    if (!details) {
      throw new NotFoundError(`Hospital with ID '${id}' not found`);
    }

    return details;
  }

  async createHospital(data: CreateHospitalInput) {
    const hospital = await this.repository.create(data);
    await redisCache.flush();
    return hospital;
  }

  async updateHospital(id: string, data: UpdateHospitalInput) {
    await this.getHospitalById(id);
    const updated = await this.repository.update(id, data);
    await redisCache.flush();
    return updated;
  }

  async deleteHospital(id: string) {
    await this.getHospitalById(id);
    await this.repository.delete(id);
    await redisCache.flush();
  }
}
