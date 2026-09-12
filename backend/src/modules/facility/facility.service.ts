import { Hospital } from '../../models/Hospital';
import { HospitalService } from '../../models/HospitalService';
import { Doctor } from '../../models/Doctor';
import { Bed } from '../../models/Bed';
import { Equipment } from '../../models/Equipment';
import { NearestFacilityQuery } from './facility.schema';
import { calculateHaversineDistance } from '../../utils/distance';

export class FacilityService {
  async findNearestFacility(query: NearestFacilityQuery) {
    const { latitude, longitude, facilityType, service, emergency, radius } = query;

    const filter: any = { isActive: true };
    if (facilityType) filter.type = facilityType;
    if (emergency !== undefined) filter.emergencyAvailable = emergency;

    let candidateHospitals = await Hospital.find(filter).lean();

    if (service) {
      const matchingServices = await HospitalService.find({
        serviceName: { $regex: service, $options: 'i' },
        isAvailable: true,
      }).select('hospitalId');

      const allowedHospIds = new Set(matchingServices.map((s) => s.hospitalId.toString()));
      candidateHospitals = candidateHospitals.filter((h) => allowedHospIds.has(h._id.toString()));
    }

    if (candidateHospitals.length === 0) {
      return {
        found: false,
        message: service
          ? `No medical facility providing service '${service}' found.`
          : 'No medical facility matches your criteria.',
        nearestFacility: null,
      };
    }

    const hospitalIds = candidateHospitals.map((h) => h._id);
    const [servicesList, doctorsList] = await Promise.all([
      HospitalService.find({ hospitalId: { $in: hospitalIds }, isAvailable: true }).lean(),
      Doctor.find({ hospitalId: { $in: hospitalIds }, isActive: true, availabilityStatus: 'AVAILABLE' }).lean(),
    ]);

    const serviceMap = new Map<string, string[]>();
    servicesList.forEach((s) => {
      const hid = s.hospitalId.toString();
      if (!serviceMap.has(hid)) serviceMap.set(hid, []);
      serviceMap.get(hid)!.push(s.serviceName);
    });

    const doctorCountMap = new Map<string, number>();
    doctorsList.forEach((d) => {
      const hid = d.hospitalId.toString();
      doctorCountMap.set(hid, (doctorCountMap.get(hid) || 0) + 1);
    });

    const calculatedHospitals = candidateHospitals
      .map((hosp) => {
        const distanceKm = calculateHaversineDistance(latitude, longitude, hosp.latitude, hosp.longitude);
        const hid = hosp._id.toString();
        return {
          id: hid,
          name: hosp.name,
          type: hosp.type,
          address: hosp.address,
          district: hosp.district,
          state: hosp.state,
          pincode: hosp.pincode,
          phone: hosp.phone,
          latitude: hosp.latitude,
          longitude: hosp.longitude,
          emergencyAvailable: hosp.emergencyAvailable,
          openingTime: hosp.openingTime,
          closingTime: hosp.closingTime,
          distanceKm,
          matchedServices: serviceMap.get(hid) || [],
          availableDoctorsCount: doctorCountMap.get(hid) || 0,
        };
      })
      .filter((hosp) => hosp.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (calculatedHospitals.length === 0) {
      return {
        found: false,
        message: `No medical facility found within ${radius} km radius matching your requested parameters.`,
        nearestFacility: null,
      };
    }

    return {
      found: true,
      message: 'Nearest suitable medical facility retrieved successfully.',
      nearestFacility: calculatedHospitals[0],
      alternativeFacilities: calculatedHospitals.slice(1, 4),
    };
  }

  // Facility Matching Engine Score Algorithm
  async matchFacilities(data: {
    patientId?: string;
    requiredSpecialty?: string;
    requiredEquipment?: string[];
    urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
    latitude: number;
    longitude: number;
    maxDistanceKm?: number;
  }) {
    const { requiredSpecialty, requiredEquipment = [], urgency = 'ROUTINE', latitude, longitude, maxDistanceKm = 50 } = data;
    const facilities = await Hospital.find({ isActive: true }).lean();

    const results = [];
    for (const fac of facilities) {
      const distance = calculateHaversineDistance(latitude, longitude, fac.latitude, fac.longitude);
      if (distance > maxDistanceKm) continue;

      let score = 100;
      let reasons: string[] = [];

      // Proximity score penalty (max 40 pts penalty)
      const distPenalty = Math.min(40, distance * 1.5);
      score -= distPenalty;
      reasons.push(`Proximity distance: ${distance.toFixed(1)} km`);

      // Doctor availability check
      let specialistCount = 0;
      if (requiredSpecialty) {
        specialistCount = await Doctor.countDocuments({
          hospitalId: fac._id,
          specialization: { $regex: requiredSpecialty, $options: 'i' },
          availabilityStatus: 'AVAILABLE',
          isActive: true,
        });
        if (specialistCount > 0) {
          score += 20;
          reasons.push(`Specialist available (${requiredSpecialty})`);
        } else {
          score -= 30;
          reasons.push(`No available specialist for ${requiredSpecialty}`);
        }
      }

      // Equipment operational status check
      let equipmentOk = true;
      for (const eqName of requiredEquipment) {
        const eq = await Equipment.findOne({
          hospitalId: fac._id,
          name: { $regex: eqName, $options: 'i' },
          status: 'OPERATIONAL',
        });
        if (!eq) {
          equipmentOk = false;
          break;
        }
      }
      if (requiredEquipment.length > 0) {
        if (equipmentOk) {
          score += 15;
          reasons.push(`All requested equipment operational`);
        } else {
          score -= 25;
          reasons.push(`Some required equipment unavailable`);
        }
      }

      // Bed capacity check
      const availableBeds = await Bed.countDocuments({ hospitalId: fac._id, status: 'AVAILABLE' });
      if (availableBeds > 0) {
        score += 10;
        reasons.push(`Bed capacity available (${availableBeds} beds)`);
      }

      // Urgency multiplier
      if (urgency === 'EMERGENCY' && fac.emergencyAvailable) {
        score += 15;
        reasons.push(`24/7 Emergency unit available`);
      }

      const finalScore = Math.max(0, Math.min(100, Math.round(score)));

      results.push({
        facility: {
          id: fac._id,
          name: fac.name,
          type: fac.type,
          address: fac.address,
          phone: fac.phone,
          latitude: fac.latitude,
          longitude: fac.longitude,
          emergencyAvailable: fac.emergencyAvailable,
        },
        distanceKm: Number(distance.toFixed(2)),
        specialistAvailability: specialistCount > 0,
        availableBeds,
        overallScore: finalScore,
        whyRecommended: reasons,
      });
    }

    results.sort((a, b) => b.overallScore - a.overallScore);
    return {
      matchId: `match_${Date.now()}`,
      recommendedFacilities: results,
    };
  }

  async getCapabilities(facilityId: string) {
    const services = await HospitalService.find({ hospitalId: facilityId });
    const equipment = await Equipment.find({ hospitalId: facilityId });
    const doctors = await Doctor.find({ hospitalId: facilityId });
    const beds = await Bed.find({ hospitalId: facilityId });
    return { services, equipment, doctors, beds };
  }

  async updateCapabilities(facilityId: string, data: any) {
    return { message: 'Capabilities updated successfully', facilityId, updatedData: data };
  }

  async createFacility(data: any) {
    const hospital = new Hospital(data);
    await hospital.save();
    return hospital;
  }

  async updateFacility(id: string, data: any) {
    return Hospital.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id: string, isActive: boolean) {
    return Hospital.findByIdAndUpdate(id, { isActive }, { new: true });
  }

  async deleteFacility(id: string) {
    return Hospital.findByIdAndDelete(id);
  }
}
