import type {
  CareTimelineEvent,
  CareEpisode,
  PatientCareProfile,
  MyCareOverview,
  NextActionGuidance,
  PrescriptionItem,
  CareCategory,
} from '@/types/record'
import type { AppointmentDetail } from '@/types/appointment'
import type { ActiveToken } from '@/types/queue'
import type { ReferralClinicalSummary } from '@/types/referral'
import { appointmentService } from './appointmentService'
import { queueService } from './queueService'
import { referralService } from './referralService'

const TIMELINE_STORAGE_KEY = 'healthconnect_care_timeline_v1'
const MEDS_STORAGE_KEY = 'healthconnect_active_medications_v1'

const PATIENT_PROFILE: PatientCareProfile = {
  patientId: 'pat-rajesh-sharma',
  patientName: 'Rajesh Sharma',
  abhaId: '14-8842-1920-5531',
  age: 48,
  gender: 'Male',
  bloodGroup: 'B+ (Positive)',
  allergies: ['Penicillin (Severe Angioedema)', 'Sulfa Drugs (Mild Rash)'],
  chronicConditions: ['Hypertension (Grade 1)', 'Dyslipidemia'],
  primaryHealthCentre: 'Community Health Centre (CHC) Shivpur',
  emergencyContact: {
    name: 'Sunita Sharma',
    relation: 'Spouse',
    phone: '+91 98765 43211',
  },
}

const SEED_EPISODES: CareEpisode[] = [
  {
    id: 'episode-cardiac-2026',
    title: 'Acute Coronary Evaluation & Interventional Cardiology Workup',
    conditionName: 'Suspected Acute Coronary Syndrome / Angina',
    startedAtIso: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    lastActivityIso: new Date().toISOString(),
    status: 'ACTIVE',
    primarySpecialty: 'Cardiology & Cath Lab',
    leadFacilityName: 'Sir Sunderlal Hospital, IMS BHU',
    associatedFacilities: [
      'Community Health Centre (CHC) Shivpur',
      'Sir Sunderlal Hospital, IMS BHU',
    ],
    eventCount: 4,
    summary:
      'Coordinated public health continuum beginning at CHC triage with digital 12-lead ECG, rapid inter-facility referral, and ICU telemetry bed reservation at IMS BHU tertiary cardiology centre.',
    keyOutcomes: [
      'Baseline 12-lead ECG documented at CHC',
      'Zero-billing Ayushman tertiary bed lock confirmed',
      'Tertiary Cath Lab evaluation scheduled with Prof. R. C. Shukla',
    ],
  },
  {
    id: 'episode-hypertension-2026',
    title: 'Long-term Hypertension & Metabolic Surveillance',
    conditionName: 'Essential Hypertension & Dyslipidemia',
    startedAtIso: new Date(Date.now() - 45 * 86400 * 1000).toISOString(),
    lastActivityIso: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    status: 'UNDER_OBSERVATION',
    primarySpecialty: 'General Medicine & Family Health',
    leadFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    associatedFacilities: [
      'Pandit Deendayal Upadhyay District Hospital',
      'Community Health Centre (CHC) Shivpur',
    ],
    eventCount: 3,
    summary:
      'Regular bi-weekly blood pressure tracking, fasting metabolic panels, and Jan Aushadhi generic medication compliance.',
    keyOutcomes: [
      'Target BP stable under 140/90 mmHg',
      'Pradhan Mantri Jan Aushadhi 30-day generic refill dispensed',
    ],
  },
]

const SEED_MEDICATIONS: PrescriptionItem[] = [
  {
    id: 'med-001',
    medicineName: 'Tab. Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    dosage: '20 mg',
    frequency: '0-0-1 (Once daily at bedtime)',
    durationDays: 30,
    instructions: 'Take after dinner at bedtime with a full glass of water. Do not skip doses.',
    prescribedBy: 'Dr. Priya Tripathi (CHC Shivpur)',
    prescribedAtIso: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    isActive: true,
    refillsRemaining: 2,
    pharmacyStatus: 'DISPENSED',
  },
  {
    id: 'med-002',
    medicineName: 'Tab. Aspirin (Ecosprin) 75mg',
    genericName: 'Aspirin (Enteric Coated)',
    dosage: '75 mg',
    frequency: '0-1-0 (Once daily after lunch)',
    durationDays: 30,
    instructions: 'Take strictly after meals to prevent gastric irritation. Report any abnormal bruising.',
    prescribedBy: 'Dr. Priya Tripathi (CHC Shivpur)',
    prescribedAtIso: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    isActive: true,
    refillsRemaining: 2,
    pharmacyStatus: 'DISPENSED',
  },
  {
    id: 'med-003',
    medicineName: 'Tab. Telmisartan 40mg',
    genericName: 'Telmisartan',
    dosage: '40 mg',
    frequency: '1-0-0 (Once daily in morning)',
    durationDays: 60,
    instructions: 'Take in the morning at the same time every day. Monitor blood pressure weekly.',
    prescribedBy: 'Dr. Anand Verma (Pandit Deendayal Upadhyay DH)',
    prescribedAtIso: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    isActive: true,
    refillsRemaining: 3,
    pharmacyStatus: 'DISPENSED',
  },
  {
    id: 'med-004',
    medicineName: 'Syp. Sucralfate 500mg/5ml',
    genericName: 'Sucralfate Oral Suspension',
    dosage: '10 ml',
    frequency: '1-0-1 (Twice daily, 1 hour before meals)',
    durationDays: 7,
    instructions: 'Shake well before use. Take on an empty stomach.',
    prescribedBy: 'Dr. Priya Tripathi (CHC Shivpur)',
    prescribedAtIso: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    isActive: false,
    refillsRemaining: 0,
    pharmacyStatus: 'DISPENSED',
  },
]

const SEED_TIMELINE_EVENTS: CareTimelineEvent[] = [
  {
    id: 'evt-001',
    dateIso: new Date().toISOString(),
    displayDate: 'Today • 11:30 AM',
    eventType: 'REFERRAL_TRANSFER',
    category: 'REFERRALS',
    title: 'Inter-Facility Cardiology Bed Reservation & Transfer',
    facilityId: 'fac-bhu-ssh',
    facilityName: 'Sir Sunderlal Hospital, IMS BHU',
    facilityTier: 'TERTIARY_AIIMS',
    department: 'Cardiology OPD & Cath Lab Reception',
    clinicianName: 'Prof. R. C. Shukla',
    clinicianRole: 'Senior Consultant Interventional Cardiologist',
    chiefComplaint: 'Acute chest tightness radiating to left shoulder on exertion',
    diagnosis: 'Suspected Acute Coronary Syndrome / ST Elevation Rule-out',
    clinicalNotes:
      'Referral accepted by IMS BHU Cardiology unit. Immediate ICU telemetry bed reserved under Ayushman Bharat PM-JAY. Direct report to Room SS-302.',
    referralSummary: {
      referralCode: 'REF-2026-9041',
      destinationFacility: 'Sir Sunderlal Hospital, IMS BHU',
      reason: 'Urgent Coronary Angiography and 2D Echocardiogram required; CHC lacks Cath Lab.',
      status: 'ACCEPTED_BED_LOCKED',
    },
    actionRequired: true,
    actionLabel: 'View Active Referral Slip',
    actionRoute: '/patient/referrals/ref-001',
    signedByDoctorName: 'Prof. R. C. Shukla',
    doctorRegistrationNumber: 'MCI-UP-184920',
    episodeId: 'episode-cardiac-2026',
  },
  {
    id: 'evt-002',
    dateIso: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    displayDate: 'Today • 09:15 AM',
    eventType: 'DIAGNOSTIC_LAB',
    category: 'DIAGNOSTICS',
    title: 'Emergency 12-Lead ECG & Rapid Cardiac Troponin-T',
    facilityId: 'fac-shivpur-chc',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    facilityTier: 'CHC',
    department: 'Emergency & Triage Room',
    clinicianName: 'Dr. Priya Tripathi',
    clinicianRole: 'Medical Officer In-Charge',
    diagnostics: [
      {
        testName: '12-Lead Electrocardiogram (ECG)',
        category: 'CARDIOLOGY',
        resultValue: 'Sinus Rhythm, ST-segment depression in V3-V5 (1.5mm)',
        referenceRange: 'Normal sinus rhythm, no ischemic ST changes',
        interpretationNotice:
          'Electrocardiographic tracing demonstrates regional repolarization variation. Correlate clinically with cardiac enzyme assays.',
        reportReleasedAtIso: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        verifiedByDoctor: 'Dr. Priya Tripathi',
      },
      {
        testName: 'Cardiac Troponin-T (Point-of-Care Quantitative)',
        category: 'BIOCHEMISTRY',
        resultValue: '0.12',
        unit: 'ng/mL',
        referenceRange: '< 0.04 ng/mL',
        interpretationNotice:
          'Troponin-T elevated above baseline cutoff. Verified on Roche Cobas h232 analyzer.',
        reportReleasedAtIso: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        verifiedByDoctor: 'Dr. Priya Tripathi',
      },
    ],
    clinicalNotes:
      'ECG tracing verified at triage counter. Given initial anti-platelet loading dose and initiated inter-facility tertiary referral.',
    attachmentCount: 2,
    signedByDoctorName: 'Dr. Priya Tripathi',
    doctorRegistrationNumber: 'UP-MC-67381',
    episodeId: 'episode-cardiac-2026',
  },
  {
    id: 'evt-003',
    dateIso: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    displayDate: 'Today • 08:30 AM',
    eventType: 'CLINICAL_ENCOUNTER',
    category: 'CONSULTATIONS',
    title: 'Primary Emergency Consultation & Triage',
    facilityId: 'fac-shivpur-chc',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    facilityTier: 'CHC',
    department: 'General Outpatient & Triage Room',
    clinicianName: 'Dr. Priya Tripathi',
    clinicianRole: 'Medical Officer In-Charge',
    chiefComplaint: 'Sudden retrosternal heaviness and breathlessness on brisk walking',
    diagnosis: 'Angina Pectoris / Suspected Unstable Coronary Ischemia (ICD-10 I20.0)',
    vitals: {
      bloodPressureSystolic: 148,
      bloodPressureDiastolic: 92,
      pulseBpm: 88,
      temperatureFahrenheit: 98.4,
      spo2Percent: 97,
      respiratoryRate: 20,
      recordedAtIso: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    },
    clinicalNotes:
      'Patient arrived ambulatory accompanied by family. Bilateral breath sounds clear, heart sounds normal S1/S2 with no audible gallop. Ordered stat 12-lead ECG and Troponin-T.',
    signedByDoctorName: 'Dr. Priya Tripathi',
    doctorRegistrationNumber: 'UP-MC-67381',
    episodeId: 'episode-cardiac-2026',
  },
  {
    id: 'evt-004',
    dateIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    displayDate: 'Yesterday • 04:30 PM',
    eventType: 'PRESCRIPTION_MEDICINE',
    category: 'MEDICINES',
    title: 'Jan Aushadhi Generic Pharmacy Dispensation',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pradhan Mantri Bhartiya Janaushadhi Pendra (Pandeypur)',
    facilityTier: 'DISTRICT_HOSPITAL',
    department: 'Central Pharmacy Counter #02',
    clinicianName: 'Pharmacist Suresh Chandra',
    clinicianRole: 'Registered Senior Pharmacist',
    prescriptions: [
      SEED_MEDICATIONS[0],
      SEED_MEDICATIONS[1],
      SEED_MEDICATIONS[2],
    ],
    clinicalNotes:
      '30-day generic medication kit dispensed under PM-JAY zero-out-of-pocket entitlement. Storage instructions in Hindi provided.',
    attachmentCount: 1,
    signedByDoctorName: 'Dr. Priya Tripathi',
    doctorRegistrationNumber: 'UP-MC-67381',
    episodeId: 'episode-cardiac-2026',
  },
  {
    id: 'evt-005',
    dateIso: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    displayDate: '07 Sep 2026 • 10:00 AM',
    eventType: 'CLINICAL_ENCOUNTER',
    category: 'CONSULTATIONS',
    title: 'Hypertension Review & General Medicine Consultation',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    department: 'Internal Medicine OPD-102',
    clinicianName: 'Dr. Anand Verma',
    clinicianRole: 'Senior Consultant Physician',
    chiefComplaint: 'Routine blood pressure review; occasional morning occipital headache',
    diagnosis: 'Essential Primary Hypertension (ICD-10 I10)',
    vitals: {
      bloodPressureSystolic: 152,
      bloodPressureDiastolic: 94,
      pulseBpm: 82,
      temperatureFahrenheit: 98.2,
      spo2Percent: 98,
      respiratoryRate: 18,
      recordedAtIso: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    },
    clinicalNotes:
      'Blood pressure remains slightly above target range. Advised reduction in dietary sodium (<5g/day), continued brisk morning walks, and full compliance with Telmisartan.',
    signedByDoctorName: 'Dr. Anand Verma',
    doctorRegistrationNumber: 'UP-MC-41982',
    episodeId: 'episode-hypertension-2026',
  },
  {
    id: 'evt-006',
    dateIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    displayDate: '31 Aug 2026 • 02:15 PM',
    eventType: 'DIAGNOSTIC_LAB',
    category: 'DIAGNOSTICS',
    title: 'Fasting Lipid Profile & Metabolic Blood Panel',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    department: 'Central Pathology Laboratory',
    clinicianName: 'Dr. Manisha Rao',
    clinicianRole: 'Chief Clinical Pathologist',
    diagnostics: [
      {
        testName: 'Fasting Plasma Glucose (FBS)',
        category: 'BIOCHEMISTRY',
        resultValue: '118',
        unit: 'mg/dL',
        referenceRange: '70–100 mg/dL (Normal)',
        interpretationNotice: 'Impaired fasting glycaemia noted. Lifestyle and dietary review advised.',
        reportReleasedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Serum Total Cholesterol',
        category: 'BIOCHEMISTRY',
        resultValue: '224',
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        interpretationNotice: 'Mild hypercholesterolemia. Verified by enzymatic colorimetric assay.',
        reportReleasedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Serum LDL Cholesterol',
        category: 'BIOCHEMISTRY',
        resultValue: '142',
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        interpretationNotice: 'Elevated atherogenic lipoprotein. Statins prescribed accordingly.',
        reportReleasedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
    ],
    clinicalNotes:
      'Samples drawn in fasting state (12 hours). Reports digitally transmitted to Ayushman Bharat Digital Mission (ABDM) locker.',
    attachmentCount: 3,
    signedByDoctorName: 'Dr. Manisha Rao',
    doctorRegistrationNumber: 'UP-MC-88219',
    episodeId: 'episode-hypertension-2026',
  },
  {
    id: 'evt-007',
    dateIso: new Date(Date.now() - 25 * 86400 * 1000).toISOString(),
    displayDate: '16 Aug 2026 • 11:00 AM',
    eventType: 'CLINICAL_ENCOUNTER',
    category: 'CONSULTATIONS',
    title: 'Orthopedic Evaluation & Digital Radiography',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    department: 'Department of Orthopedics & Trauma',
    clinicianName: 'Dr. Alok Srivastava',
    clinicianRole: 'Consultant Orthopedic Surgeon',
    chiefComplaint: 'Right leg pain following accidental curb trip',
    diagnosis: 'Right Tibia Contusion with no cortical break (ICD-10 S80.0)',
    diagnostics: [
      {
        testName: 'Digital X-Ray Right Tibia-Fibula (AP & Lateral)',
        category: 'IMAGING',
        resultValue: 'Intact bony cortex, no fracture line or subluxation seen.',
        referenceRange: 'Normal radiological appearance of bone and joint structures.',
        interpretationNotice: 'Soft tissue edema localized over mid-shaft tibia.',
        verifiedByDoctor: 'Dr. Alok Srivastava',
      },
    ],
    clinicalNotes:
      'Immobilization bandage applied for 5 days. Advised rest, ice compresses, and limb elevation. Pain subsided.',
    signedByDoctorName: 'Dr. Alok Srivastava',
    doctorRegistrationNumber: 'UP-MC-55912',
  },
]

class CareService {
  private getTimelineStorage(): CareTimelineEvent[] {
    try {
      const stored = localStorage.getItem(TIMELINE_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(SEED_TIMELINE_EVENTS))
    return SEED_TIMELINE_EVENTS
  }

  private setTimelineStorage(events: CareTimelineEvent[]): void {
    try {
      localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events))
    } catch {
      // ignore
    }
  }

  /**
   * Appends an authentic clinical care timeline event (e.g. after referral completion or consultation).
   */
  async addTimelineEvent(event: CareTimelineEvent): Promise<CareTimelineEvent> {
    const list = this.getTimelineStorage()
    const updated = [event, ...list]
    this.setTimelineStorage(updated)
    return event
  }

  private getMedsStorage(): PrescriptionItem[] {
    try {
      const stored = localStorage.getItem(MEDS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(SEED_MEDICATIONS))
    return SEED_MEDICATIONS
  }

  /**
   * Retrieves the comprehensive My Care overview including dynamic Next Best Action,
   * aggregated across appointments, queues, referrals, and clinical events.
   */
  async getMyCareOverview(): Promise<MyCareOverview> {
    const [appointments, activeTokens, referrals, timelineEvents] = await Promise.all([
      appointmentService.getMyAppointments(),
      queueService.getActiveQueues(),
      referralService.getPatientReferrals(),
      this.getCareTimeline('ALL'),
    ])

    const activeAppointments = appointments.filter((a: AppointmentDetail) => a.status === 'CONFIRMED')
    const activeReferrals = referrals.filter(
      (r: ReferralClinicalSummary) =>
        r.status === 'ACCEPTED_BED_LOCKED' ||
        r.status === 'SUBMITTED' ||
        r.status === 'PENDING_ACCEPTANCE' ||
        r.status === 'FALLBACK_REROUTING' ||
        r.status === 'IN_TRANSIT',
    )
    const activeMeds = (await this.getActiveMedications()).filter((m: PrescriptionItem) => m.isActive)

    // Compute dynamic Next Best Action guidance based on real system state
    let nextAction: NextActionGuidance

    const bedLockedReferral = referrals.find((r: ReferralClinicalSummary) => r.status === 'ACCEPTED_BED_LOCKED')
    const fallbackReferral = referrals.find((r: ReferralClinicalSummary) => r.status === 'FALLBACK_REROUTING')
    const approachingToken = activeTokens.find((t: ActiveToken) => t.state === 'APPROACHING' || t.state === 'CALLED')
    const upcomingAptToday = activeAppointments.find((a: AppointmentDetail) => {
      const todayStr = new Date().toISOString().split('T')[0]
      return a.date === todayStr
    })

    if (bedLockedReferral) {
      nextAction = {
        actionRequired: true,
        urgency: 'HIGH',
        title: 'Referral Bed Confirmed at Sir Sunderlal Hospital (BHU)',
        description: `Your ICU/Specialty bed is locked until ${bedLockedReferral.bedReservationExpiryIso ? new Date(bedLockedReferral.bedReservationExpiryIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'today'}. Please proceed directly to Room SS-302 with your referral documents.`,
        targetRoute: `/patient/referrals/${bedLockedReferral.id}`,
        ctaText: 'Open Referral & Bed Pass',
        dueTimeContext: 'Bed lock active now',
      }
    } else if (fallbackReferral) {
      nextAction = {
        actionRequired: true,
        urgency: 'HIGH',
        title: 'Action Needed: Select Alternative Hospital',
        description:
          'The initial receiving trauma unit is full. A verified alternative facility with open capacity has been matched for your care continuity.',
        targetRoute: `/patient/referrals/${fallbackReferral.id}`,
        ctaText: 'Review Hospital Match',
        dueTimeContext: 'Response needed within SLA',
      }
    } else if (approachingToken) {
      nextAction = {
        actionRequired: true,
        urgency: 'HIGH',
        title: `Your Token ${approachingToken.tokenNumber} is Next in Line`,
        description: `Position #${approachingToken.positionInQueue} at ${approachingToken.departmentName} (${approachingToken.roomNumber}). Please move to the doorway with your OPD slip.`,
        targetRoute: `/patient/queue/${approachingToken.id}`,
        ctaText: 'View Live Queue Token',
        dueTimeContext: approachingToken.estimatedWaitRange,
      }
    } else if (upcomingAptToday) {
      nextAction = {
        actionRequired: true,
        urgency: 'MEDIUM',
        title: `Consultation Scheduled Today with ${upcomingAptToday.doctorName}`,
        description: `${upcomingAptToday.facilityName} (${upcomingAptToday.roomNumber}) at ${upcomingAptToday.timeSlot}. Complete pre-visit checklist before reporting.`,
        targetRoute: `/patient/appointments/${upcomingAptToday.id}`,
        ctaText: 'View Appointment Slip',
        dueTimeContext: upcomingAptToday.timeSlot,
      }
    } else {
      nextAction = {
        actionRequired: false,
        urgency: 'LOW',
        title: 'All Active Care Steps Up-to-date',
        description:
          'Your chronic condition medications and follow-up directives are registered in your Ayushman Bharat longitudinal health record.',
        targetRoute: '/patient/my-care#medications',
        ctaText: 'Review Active Medicines',
        dueTimeContext: 'Care on track',
      }
    }

    return {
      profile: PATIENT_PROFILE,
      nextAction,
      activeAppointmentCount: activeAppointments.length,
      activeReferralCount: activeReferrals.length,
      activeMedicationCount: activeMeds.length,
      activeCareEpisodeCount: SEED_EPISODES.filter((e) => e.status === 'ACTIVE').length,
      recentEvents: timelineEvents.slice(0, 5),
    }
  }

  /**
   * Retrieves the longitudinal care timeline with category filtering and text search.
   */
  async getCareTimeline(category: CareCategory = 'ALL', searchQuery: string = ''): Promise<CareTimelineEvent[]> {
    const allEvents = this.getTimelineStorage()

    return allEvents.filter((event) => {
      // Category filter
      if (category !== 'ALL' && event.category !== category) {
        return false
      }

      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = event.title.toLowerCase().includes(query)
        const matchFacility = event.facilityName.toLowerCase().includes(query)
        const matchDoctor = event.clinicianName.toLowerCase().includes(query)
        const matchDept = event.department.toLowerCase().includes(query)
        const matchDiagnosis = event.diagnosis ? event.diagnosis.toLowerCase().includes(query) : false
        const matchComplaint = event.chiefComplaint ? event.chiefComplaint.toLowerCase().includes(query) : false

        return matchTitle || matchFacility || matchDoctor || matchDept || matchDiagnosis || matchComplaint
      }

      return true
    })
  }

  /**
   * Retrieves full clinical detail for an individual care event.
   */
  async getCareEventById(id: string): Promise<CareTimelineEvent | null> {
    const all = this.getTimelineStorage()
    return all.find((e) => e.id === id) || null
  }

  /**
   * Retrieves the active digital medication prescriptions.
   */
  async getActiveMedications(): Promise<PrescriptionItem[]> {
    return this.getMedsStorage()
  }

  /**
   * Retrieves connected care episodes.
   */
  async getCareEpisodes(): Promise<CareEpisode[]> {
    return SEED_EPISODES
  }

  /**
   * Retrieves citizen health profile.
   */
  async getPatientProfile(): Promise<PatientCareProfile> {
    return PATIENT_PROFILE
  }
}

export const careService = new CareService()
