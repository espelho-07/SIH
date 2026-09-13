import { Patient } from '../../models/Patient';
import { Encounter } from '../../models/Encounter';
import { AshaVisit } from '../../models/AshaVisit';
import { Referral } from '../../models/Referral';

export class EhrService {
  async getTimeline(patientId: string) {
    const [encounters, visits, referrals] = await Promise.all([
      Encounter.find({ patientId }).populate('doctorId').populate('hospitalId').lean(),
      AshaVisit.find({ patientId }).populate('ashaId').lean(),
      Referral.find({ patientId }).populate('referringFacilityId').populate('receivingFacilityId').lean(),
    ]);

    const timelineEvents = [
      ...encounters.map((e) => ({ type: 'ENCOUNTER', timestamp: e.createdAt, data: e })),
      ...visits.map((v) => ({ type: 'ASHA_VISIT', timestamp: v.visitDate, data: v })),
      ...referrals.map((r) => ({ type: 'REFERRAL', timestamp: r.createdAt, data: r })),
    ];

    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return timelineEvents;
  }

  async getHealthRecord(patientId: string) {
    const patient = await Patient.findById(patientId);
    const timeline = await this.getTimeline(patientId);
    return {
      patient,
      summary: {
        totalEncounters: timeline.filter((t) => t.type === 'ENCOUNTER').length,
        totalVisits: timeline.filter((t) => t.type === 'ASHA_VISIT').length,
        totalReferrals: timeline.filter((t) => t.type === 'REFERRAL').length,
      },
      timeline,
    };
  }

  async getFhirExport(patientId: string) {
    const patient = await Patient.findById(patientId);
    if (!patient) return null;

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: patient._id.toString(),
            name: [{ text: patient.name }],
            gender: patient.gender.toLowerCase(),
            telecom: [{ system: 'phone', value: patient.phone }],
          },
        },
      ],
    };
  }
}
