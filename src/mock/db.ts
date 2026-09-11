import {
  DEMO_USERS,
  INITIAL_FACILITIES,
  INITIAL_LIVE_QUEUE,
  INITIAL_HEALTH_RECORD,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_REFERRALS,
  INITIAL_BED_SUMMARY,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_AMBULANCES,
  INITIAL_MEDICINES,
  INITIAL_EQUIPMENT,
  INITIAL_ASHA_PATIENTS,
  INITIAL_ASHA_VISITS,
  INITIAL_AI_SUMMARY,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_PERMISSION_MATRIX,
  INITIAL_AI_MODELS,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import { Facility, FacilityMatchRequest, FacilityMatchResult } from '@/types/facility';
import { Token, LiveQueueState, Appointment } from '@/types/queue';
import { Referral, CreateReferralRequest } from '@/types/referral';
import { Vitals, Diagnosis, Prescription, DiagnosticOrder, PatientHealthRecord } from '@/types/clinical';
import { BedSummary, BloodInventory, Ambulance, MedicineInventoryItem, EquipmentItem } from '@/types/resources';
import { AshaPatient, AshaVisit, ScreeningSession } from '@/types/asha';
import { AiDemandIntelligenceSummary } from '@/types/ai';
import { SystemHealthOverview, PermissionMatrixItem, AiModelRegistryItem, AuditLog } from '@/types/admin';
import { User } from '@/types/auth';

class MockHealthcareState {
  users: Record<string, User> = { ...DEMO_USERS };
  facilities: Facility[] = [...INITIAL_FACILITIES];
  liveQueue: LiveQueueState = JSON.parse(JSON.stringify(INITIAL_LIVE_QUEUE));
  healthRecords: Record<string, PatientHealthRecord> = {
    usr_pat_01: JSON.parse(JSON.stringify(INITIAL_HEALTH_RECORD)),
  };
  prescriptions: Prescription[] = JSON.parse(JSON.stringify(INITIAL_PRESCRIPTIONS));
  diagnosticOrders: DiagnosticOrder[] = JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_ORDERS));
  referrals: Referral[] = JSON.parse(JSON.stringify(INITIAL_REFERRALS));
  bedSummary: BedSummary = JSON.parse(JSON.stringify(INITIAL_BED_SUMMARY));
  bloodInventory: BloodInventory = JSON.parse(JSON.stringify(INITIAL_BLOOD_INVENTORY));
  ambulances: Ambulance[] = JSON.parse(JSON.stringify(INITIAL_AMBULANCES));
  medicines: MedicineInventoryItem[] = JSON.parse(JSON.stringify(INITIAL_MEDICINES));
  equipment: EquipmentItem[] = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
  ashaPatients: AshaPatient[] = JSON.parse(JSON.stringify(INITIAL_ASHA_PATIENTS));
  ashaVisits: AshaVisit[] = JSON.parse(JSON.stringify(INITIAL_ASHA_VISITS));
  screenings: ScreeningSession[] = [];
  aiSummary: AiDemandIntelligenceSummary = JSON.parse(JSON.stringify(INITIAL_AI_SUMMARY));
  systemHealth: SystemHealthOverview = JSON.parse(JSON.stringify(INITIAL_SYSTEM_HEALTH));
  permissions: PermissionMatrixItem[] = JSON.parse(JSON.stringify(INITIAL_PERMISSION_MATRIX));
  aiModels: AiModelRegistryItem[] = JSON.parse(JSON.stringify(INITIAL_AI_MODELS));
  auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  appointments: Appointment[] = [
    {
      id: 'apt_01',
      patientId: 'usr_pat_01',
      patientName: 'Rameshwar Sharma',
      patientPhone: '9876543210',
      facilityId: 'fac_civil_01',
      facilityName: 'Gandhinagar Civil Hospital',
      doctorId: 'usr_doc_01',
      doctorName: 'Dr. Arvind Patel',
      specialty: 'Cardiology',
      date: '2026-03-14',
      timeSlot: '10:00 AM',
      status: 'CONFIRMED',
      type: 'IN_PERSON',
      reasonForVisit: 'Chest pain follow-up and ECG evaluation',
      createdAt: new Date().toISOString(),
    },
  ];

  // Token & Queue operations
  generateToken(patientName: string, patientPhone: string, facilityId: string, departmentId: string, priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY' = 'ROUTINE'): Token {
    const facility = this.facilities.find((f) => f.id === facilityId) || this.facilities[0];
    const dept = facility.departments.find((d) => d.id === departmentId) || facility.departments[0];
    const num = Math.floor(Math.random() * 50) + 40;
    const tokenNumber = `A-0${num}`;

    const newToken: Token = {
      id: `tok_${Date.now()}`,
      tokenNumber,
      patientId: 'usr_pat_01',
      patientName,
      patientAge: 48,
      patientGender: 'M',
      patientPhone,
      facilityId: facility.id,
      facilityName: facility.name,
      departmentId: dept.id,
      departmentName: dept.name,
      roomNumber: 'Room 4',
      status: 'WAITING',
      priority,
      positionInQueue: this.liveQueue.tokens.filter((t) => t.status === 'WAITING').length + 1,
      estimatedWaitMinutes: (this.liveQueue.tokens.filter((t) => t.status === 'WAITING').length + 1) * 6,
      createdAt: new Date().toISOString(),
    };

    this.liveQueue.tokens.push(newToken);
    this.liveQueue.totalWaiting += 1;
    return newToken;
  }

  callNextToken(): Token | null {
    const nextWaiting = this.liveQueue.tokens.find((t) => t.status === 'WAITING');
    if (!nextWaiting) return null;

    // Mark previous calling tokens as in consultation or completed
    this.liveQueue.tokens.forEach((t) => {
      if (t.status === 'CALLED') t.status = 'IN_CONSULTATION';
    });

    nextWaiting.status = 'CALLED';
    nextWaiting.calledAt = new Date().toISOString();
    this.liveQueue.currentTokenNumber = nextWaiting.tokenNumber;
    this.liveQueue.totalWaiting = Math.max(0, this.liveQueue.totalWaiting - 1);
    this.liveQueue.updatedAt = new Date().toISOString();

    // Recalculate remaining positions
    let pos = 1;
    this.liveQueue.tokens.forEach((t) => {
      if (t.status === 'WAITING') {
        t.positionInQueue = pos;
        t.estimatedWaitMinutes = pos * 6;
        pos++;
      }
    });

    return nextWaiting;
  }

  skipToken(tokenId: string): Token | null {
    const token = this.liveQueue.tokens.find((t) => t.id === tokenId);
    if (token) {
      token.status = 'SKIPPED';
      this.liveQueue.updatedAt = new Date().toISOString();
    }
    return token || null;
  }

  markTokenNoShow(tokenId: string): Token | null {
    const token = this.liveQueue.tokens.find((t) => t.id === tokenId);
    if (token) {
      token.status = 'NO_SHOW';
      this.liveQueue.updatedAt = new Date().toISOString();
    }
    return token || null;
  }

  // Referral operations with multi-criteria matching
  matchFacilities(request: FacilityMatchRequest): FacilityMatchResult[] {
    return this.facilities.map((fac) => {
      const hasSpecialty = fac.specialties.includes(request.specialty);
      const specialistAvail: 'AVAILABLE_NOW' | 'UNAVAILABLE' = hasSpecialty ? 'AVAILABLE_NOW' : 'UNAVAILABLE';
      const hasIcu = request.requiresIcu ? fac.icuBedsAvailable > 0 : true;
      const bedStatus: 'PLENTY' | 'LIMITED' | 'CRITICAL' = fac.availableBeds > 30 ? 'PLENTY' : fac.availableBeds > 5 ? 'LIMITED' : 'CRITICAL';
      const distance = fac.distanceKm || 5;

      let score = 50;
      const reasons: string[] = [];

      if (hasSpecialty) {
        score += 30;
        reasons.push(`Specialty department active (${request.specialty})`);
      }
      if (hasIcu) {
        score += 10;
        reasons.push(`${fac.icuBedsAvailable} ICU beds currently vacant`);
      }
      if (fac.emergencyAvailable) {
        score += 5;
        reasons.push('24/7 Emergency & Trauma Unit operational');
      }
      if (distance < 10) {
        score += 5;
        reasons.push(`Nearby facility (${distance} km distance)`);
      }

      return {
        facility: fac,
        suitabilityScore: Math.min(score, 98),
        clinicalMatchPercent: hasSpecialty ? 95 : 40,
        specialistAvailability: specialistAvail,
        equipmentSuitability: true,
        bedAvailabilityStatus: bedStatus,
        distanceKm: distance,
        estimatedTransitTimeMins: Math.round(distance * 2.2),
        matchReasons: reasons,
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  createReferral(req: CreateReferralRequest): Referral {
    const destFacility = this.facilities.find((f) => f.id === req.toFacilityId) || this.facilities[0];
    const newRef: Referral = {
      id: `ref_${Date.now()}`,
      referralCode: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: req.patientId,
      patientName: 'Rameshwar Sharma',
      patientAge: 48,
      patientGender: 'Male',
      patientPhone: '9876543210',
      abhaId: '14-8921-3409-7721',
      fromFacilityId: 'fac_pet_04',
      fromFacilityName: 'Pethapur Primary Health Centre',
      fromDoctorId: 'usr_doc_pet',
      fromDoctorName: 'Dr. Neha Vaghela',
      toFacilityId: destFacility.id,
      toFacilityName: destFacility.name,
      toSpecialty: req.toSpecialty,
      reasonForReferral: req.reasonForReferral,
      clinicalSummary: req.clinicalSummary,
      priority: req.priority,
      requiredEquipment: req.requiredEquipment,
      requiredIcu: req.requiredIcu,
      status: 'CREATED',
      slaDeadline: new Date(Date.now() + (req.priority === 'EMERGENCY' ? 4 : 48) * 3600000).toISOString(),
      slaBreached: false,
      events: [
        {
          id: `ev_${Date.now()}`,
          status: 'CREATED',
          timestamp: new Date().toISOString(),
          actorName: 'Dr. Arvind Patel',
          actorRole: 'Senior Medical Officer',
          facilityName: 'Pethapur PHC',
          notes: 'Referral generated with clinical suitability matching.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.referrals.unshift(newRef);
    return newRef;
  }

  // Pharmacy & Resource mutations
  dispensePrescription(prescriptionId: string): Prescription | null {
    const rx = this.prescriptions.find((p) => p.id === prescriptionId);
    if (rx) {
      rx.status = 'DISPENSED';
      rx.items.forEach((item) => {
        item.dispensedStatus = 'DISPENSED';
        item.dispensedQuantity = item.totalQuantity;
      });
    }
    return rx || null;
  }

  updateBedStatus(facilityId: string, category: string, available: number): BedSummary {
    const targetCat = this.bedSummary.categories.find((c) => c.type === category);
    if (targetCat) {
      targetCat.available = available;
      targetCat.occupied = targetCat.total - available;
      targetCat.lastUpdated = new Date().toISOString();
    }
    this.bedSummary.totalAvailable = this.bedSummary.categories.reduce((acc, c) => acc + c.available, 0);
    this.bedSummary.totalOccupied = this.bedSummary.totalBeds - this.bedSummary.totalAvailable;
    this.bedSummary.lastUpdated = new Date().toISOString();
    return this.bedSummary;
  }
}

export const mockState = new MockHealthcareState();
