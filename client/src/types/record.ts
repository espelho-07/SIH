/**
 * HealthConnect Domain D: My Care, Health Records & Longitudinal Care Timeline Types
 * Aligned with FHIR R4 Domain D (API-EHR-001) and Indian Public Healthcare guidelines (ABDM)
 */

export type CareEventType =
  | 'CLINICAL_ENCOUNTER'     // OPD visit, consultation, physical exam
  | 'DIAGNOSTIC_LAB'         // Pathology, Biochemistry, Microbiology, ECG, Cath Lab
  | 'PRESCRIPTION_MEDICINE'  // Medication dispensed / prescribed
  | 'REFERRAL_TRANSFER'      // Specialist inter-facility escalation
  | 'APPOINTMENT_SCHEDULED'  // Upcoming or booked OPD encounter
  | 'FOLLOW_UP_DUE'          // Physician care continuity follow-up
  | 'CARE_OUTCOME'           // Discharge summary, clinical stabilization

export type CareCategory =
  | 'ALL'
  | 'CONSULTATIONS'
  | 'DIAGNOSTICS'
  | 'MEDICINES'
  | 'REFERRALS'

export interface ClinicalVitalSigns {
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  pulseBpm?: number
  temperatureFahrenheit?: number
  spo2Percent?: number
  respiratoryRate?: number
  recordedAtIso?: string
}

export interface DiagnosticResultItem {
  testName: string
  category: 'LAB_PATHOLOGY' | 'IMAGING' | 'CARDIOLOGY' | 'BIOCHEMISTRY'
  resultValue: string
  referenceRange?: string
  unit?: string
  interpretationNotice?: string
  specimenCollectedAtIso?: string
  reportReleasedAtIso?: string
  verifiedByDoctor?: string
}

export interface PrescriptionItem {
  id: string
  medicineName: string
  genericName: string
  dosage: string
  frequency: string // e.g. "0-0-1 (Night)"
  durationDays: number
  instructions: string
  prescribedBy: string
  prescribedAtIso: string
  isActive: boolean
  refillsRemaining?: number
  pharmacyStatus?: 'DISPENSED' | 'PENDING' | 'REFILL_DUE'
}

export interface CareTimelineEvent {
  id: string
  dateIso: string
  displayDate: string
  eventType: CareEventType
  category: CareCategory
  title: string
  facilityId: string
  facilityName: string
  facilityTier: string
  department: string
  clinicianName: string
  clinicianRole: string
  chiefComplaint?: string
  diagnosis?: string
  clinicalNotes?: string
  vitals?: ClinicalVitalSigns
  diagnostics?: DiagnosticResultItem[]
  prescriptions?: PrescriptionItem[]
  referralSummary?: {
    referralCode: string
    destinationFacility: string
    reason: string
    status: string
  }
  actionRequired?: boolean
  actionLabel?: string
  actionRoute?: string
  attachmentCount?: number
  signedByDoctorName: string
  doctorRegistrationNumber: string
  episodeId?: string
}

export interface CareEpisode {
  id: string
  title: string
  conditionName: string
  startedAtIso: string
  lastActivityIso: string
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_OBSERVATION'
  primarySpecialty: string
  leadFacilityName: string
  associatedFacilities: string[]
  eventCount: number
  summary: string
  keyOutcomes: string[]
}

export interface PatientCareProfile {
  patientId: string
  patientName: string
  abhaId: string
  age: number
  gender: string
  bloodGroup: string
  allergies: string[]
  chronicConditions: string[]
  primaryHealthCentre: string
  emergencyContact: {
    name: string
    relation: string
    phone: string
  }
}

export interface NextActionGuidance {
  actionRequired: boolean
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  targetRoute: string
  ctaText: string
  dueTimeContext?: string
}

export interface MyCareOverview {
  profile: PatientCareProfile
  nextAction: NextActionGuidance
  activeAppointmentCount: number
  activeReferralCount: number
  activeMedicationCount: number
  activeCareEpisodeCount: number
  activeFollowUpCount?: number
  recentEvents: CareTimelineEvent[]
}
