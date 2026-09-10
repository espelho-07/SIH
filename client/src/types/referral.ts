import type { FacilityTier, FacilityOwnership } from './facility'

export type ReferralStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_CONFIRMATION'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED_BED_LOCKED'
  | 'REJECTED'
  | 'FALLBACK_REROUTING'
  | 'APPOINTMENT_BOOKED'
  | 'IN_TRANSIT'
  | 'PATIENT_ARRIVED'
  | 'IN_TREATMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED_SLA'

export type ReferralUrgency =
  | 'ROUTINE'          // Routine specialized care within 24-48 hours
  | 'URGENT'           // Urgent evaluation within 4 hours
  | 'CRITICAL_TRAUMA'  // Critical trauma / Acute coronary / Immediate (<=30 mins)

export interface ReferralTimelineEvent {
  id: string
  timestampIso: string
  title: string
  description: string
  actor: string
  status: ReferralStatus
}

export interface ReceivingFacilityMatch {
  facilityId: string
  facilityName: string
  facilityTier: FacilityTier
  ownership: FacilityOwnership
  address: string
  distanceKm: number
  estimatedTravelTimeMins: number
  matchScore: number // e.g. 96 (%)
  hasRequiredSpecialty: boolean
  hasRequiredEquipment: boolean
  hasBedCapacity: boolean
  availableIcuBeds: number
  availableOxygenBeds: number
  availableGeneralBeds: number
  acceptanceCapability: 'HIGH_CAPACITY' | 'ACCEPTING' | 'LIMITED' | 'UNAVAILABLE'
  specialistsOnDuty: string[]
  diagnosticSupport: string[]
  reasonsWhySuitable: string[]
  isAyushmanEmpaneled: boolean
  emergencyHelpline: string
  nextAvailableSlot: string
}

export interface ReferralClinicalSummary {
  id: string
  referralCode: string // e.g. "REF-2026-9041"
  patientId: string
  patientName: string
  patientAge: number
  patientGender: 'Male' | 'Female' | 'Other'
  patientPhone: string
  abhaId?: string

  // Originating Facility & Clinician
  referringFacilityId: string
  referringFacilityName: string
  referringFacilityTier: FacilityTier
  referringFacilityAddress: string
  referringDoctorId: string
  referringDoctorName: string
  referringDoctorSpecialty: string

  // Clinical Rationale & Directives
  clinicalReason: string
  plainLanguageExplanation: string
  requiredSpecialty: string
  requiredTreatments: string[]
  requiredDiagnostics: string[]
  urgency: ReferralUrgency
  slaExpiresAtIso: string

  // Target / Receiving Facility
  receivingFacilityId: string | null
  receivingFacilityName: string | null
  receivingFacilityAddress?: string
  receivingFacilityTier?: FacilityTier
  receivingDoctorName?: string
  receivingDoctorSpecialty?: string

  // Status & Tracking
  status: ReferralStatus
  rejectionReason?: string
  fallbackFacilitySuggested?: boolean
  fallbackFacilityId?: string

  // Bed Reservation & Transit Handshake
  bedReserved: boolean
  bedReservationType?: 'ICU' | 'OXYGEN' | 'GENERAL'
  bedReservationExpiryIso?: string
  ambulanceDispatched?: boolean
  ambulanceVehicleNumber?: string
  ambulanceDriverPhone?: string
  ambulanceEtaMinutes?: number

  // Linked Care Continuity Points
  linkedAppointmentId?: string
  linkedAppointmentRef?: string
  linkedAppointmentTime?: string
  linkedQueueToken?: string // e.g. "REF-014"

  // Check-in & Outcome Closure
  arrivedAtIso?: string
  consultationStartedAtIso?: string
  completedAtIso?: string
  outcomeReceipt?: {
    closingDiagnosis: string
    consultationSummary: string
    prescriptionsIssued: string[]
    followUpRequired: boolean
    followUpDate?: string
    feedbackTransmittedToOriginatingFacility: boolean
    closedAtIso: string
    dischargingDoctorName: string
  }

  // Pre-Arrival Instructions & Physical Checklist
  instructions: string[]
  requiredDocuments: string[]
  patientActionRequired: boolean
  nextActionInstruction: string

  createdAtIso: string
  updatedAtIso: string
  events: ReferralTimelineEvent[]
}

// Backward compatibility alias
export type ReferralHandshake = ReferralClinicalSummary
