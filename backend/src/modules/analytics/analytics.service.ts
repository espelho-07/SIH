import { Encounter } from '../../models/Encounter';
import { Referral } from '../../models/Referral';
import { Bed } from '../../models/Bed';
import { HospitalMedicine } from '../../models/HospitalMedicine';
import { BloodInventory } from '../../models/BloodInventory';

export class AnalyticsService {
  async getFacilityAnalytics(facilityId: string) {
    const [encountersCount, referralsCount, totalBeds, availableBeds] = await Promise.all([
      Encounter.countDocuments({ hospitalId: facilityId }),
      Referral.countDocuments({ receivingFacilityId: facilityId }),
      Bed.countDocuments({ hospitalId: facilityId }),
      Bed.countDocuments({ hospitalId: facilityId, status: 'AVAILABLE' }),
    ]);

    return {
      facilityId,
      patientCount: encountersCount,
      activeQueueCount: Math.floor(Math.random() * 15) + 3,
      referralsCount,
      bedOccupancyRate: totalBeds > 0 ? Number((((totalBeds - availableBeds) / totalBeds) * 100).toFixed(1)) : 0,
      totalBeds,
      availableBeds,
    };
  }

  async getDiseaseTrends() {
    return [
      { disease: 'Dengue', week: 'W36', cases: 82, trend: 'UP', alertLevel: 'HIGH' },
      { disease: 'Malaria', week: 'W36', cases: 45, trend: 'STABLE', alertLevel: 'MEDIUM' },
      { disease: 'Typhoid', week: 'W36', cases: 29, trend: 'DOWN', alertLevel: 'LOW' },
      { disease: 'Acute Gastroenteritis', week: 'W36', cases: 94, trend: 'UP', alertLevel: 'HIGH' },
    ];
  }

  async getOutbreakAlerts() {
    return [
      {
        id: 'alert_1',
        area: 'Rajkot North',
        disease: 'Dengue',
        riskLevel: 'HIGH',
        observedCases: 82,
        expectedCases: 45,
        deviation: 82.2,
        message: 'Unusual spike in acute febrile illness',
        status: 'EARLY_WARNING',
        timestamp: new Date(),
      },
    ];
  }

  async getEpidemicHeatmap() {
    return {
      district: 'Rajkot',
      clusters: [
        { zone: 'Rajkot East', lat: 22.3039, lng: 70.8022, risk: 'HIGH', cases: 110 },
        { zone: 'Rajkot West', lat: 22.285, lng: 70.78, risk: 'MEDIUM', cases: 42 },
      ],
    };
  }
}
