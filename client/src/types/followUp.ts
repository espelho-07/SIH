/**
 * HealthConnect Domain: Follow-up, Ongoing Care & Patient Continuity Types
 * Aligned with ABDM, FHIR R4 CarePlan/ServiceRequest, and Indian Public Health standards (NHM)
 */

export type FollowUpStatus =
  | 'RECOMMENDED'        // Recommended by doctor, awaiting due window
  | 'DUE'                // Currently due for booking / completion
  | 'UPCOMING'           // Appointment scheduled, coming up soon
  | 'SCHEDULED'          // Confirmed appointment booked
  | 'COMPLETED'          // Consultation attended, care episode continued or closed
  | 'MISSED'             // Target due date passed without appointment
  | 'RESCHEDULED'        // Appointment moved to new slot
  | 'CANCELLED'          // Cancelled by patient or doctor
  | 'NO_LONGER_REQUIRED' // Clinician determined no further follow-up needed

export type FollowUpUrgency = 'ROUTINE' | 'PRIORITY' | 'MONITORED'

export type FollowUpOriginType =
  | 'CONSULTATION'   // General/Specialist OPD visit
  | 'REFERRAL'       // Post-referral outcome receipt
  | 'DISCHARGE'      // Post-inpatient / emergency stabilization
  | 'DIAGNOSTIC'     // Post-lab / imaging review
  | 'CHRONIC_CARE'   // Periodic surveillance (Hypertension, Diabetes)
  | 'MATERNAL_CHILD' // JSSK / Immunization schedule

export interface FollowUpPrerequisiteDiagnostic {
  testId?: string
  testName: string
  category: 'LAB_PATHOLOGY' | 'IMAGING' | 'CARDIOLOGY' | 'BIOCHEMISTRY'
  status: 'REQUIRED' | 'SAMPLE_COLLECTED' | 'REPORT_READY'
  reportId?: string
  instructions?: string // e.g. "Complete fasting lipid profile 2 days before follow-up appointment"
  reportReleasedAtIso?: string
}

export interface FollowUpLinkedMedication {
  medicineId: string
  name: string
  dosage: string
  status: 'CURRENT' | 'COMPLETED_COURSE' | 'NEEDS_REFILL'
}

export interface FrontlineWorkerContinuity {
  workerName: string
  workerRole: 'ASHA' | 'ANM' | 'CHO'
  assignedArea: string
  lastContactIso?: string
  notes?: string
  homeVisitStatus?: 'SCHEDULED' | 'COMPLETED' | 'NONE'
  homeVisitDate?: string
  vitalsObserved?: {
    bp?: string
    spo2?: string
    pulse?: string
  }
}

export interface FollowUpCareItem {
  id: string                   // e.g. "FOL-2026-01"
  title: string                // e.g. "Hypertension Metabolic Review & Statin Compliance"
  condition: string            // e.g. "Essential Primary Hypertension"
  specialty: string            // e.g. "General Medicine"
  originType: FollowUpOriginType
  originReferenceId: string    // Consultation ID / Referral ID / Episode ID
  originSummary: string        // "Follow-up recommended by Dr. Anand Verma following review on 07 Sep 2026"

  // Facility & Clinician Info
  facilityId: string
  facilityName: string
  facilityTier: string
  facilityAddress: string
  departmentName: string
  doctorName: string
  doctorRole: string
  doctorRegistrationNumber: string

  // Timeframes & Status
  recommendedDateIso: string   // Target due date (e.g. "2026-09-18")
  windowStartIso: string       // Earliest recommended date (e.g. "2026-09-14")
  windowEndIso: string         // Latest recommended date (e.g. "2026-09-24")
  status: FollowUpStatus
  urgency: FollowUpUrgency

  // Instructions & Clinical Context (Authorized for Patient Display)
  clinicalReason: string       // "Assess blood pressure stability, review fasting lipid panel, and confirm Atorvastatin tolerance."
  patientInstructions: string[] // ["Fast 10-12 hours prior to visit for repeat blood sugar check", "Carry current medication blister packs"]

  // Linked Entities
  prerequisiteDiagnostics?: FollowUpPrerequisiteDiagnostic[]
  linkedMedications?: FollowUpLinkedMedication[]
  linkedReferralCode?: string
  linkedEpisodeId?: string

  // Appointment Link (when SCHEDULED or COMPLETED)
  linkedAppointmentId?: string
  linkedAppointmentDate?: string
  linkedAppointmentSlot?: string
  linkedRoomNumber?: string
  linkedTokenNumber?: string   // If checked in for OPD token

  // Frontline Continuity
  frontlineContinuity?: FrontlineWorkerContinuity

  // Completion / Outcome Record (when COMPLETED)
  completedAtIso?: string
  outcomeSummary?: string
  nextFollowUpRecommended?: boolean
  nextFollowUpId?: string

  // Cancellation or Missed reason
  missedNotice?: string
  cancellationReason?: string

  createdAtIso: string
  updatedAtIso: string
}

export interface FollowUpFilterOptions {
  statusCategory?: 'NEEDS_ATTENTION' | 'UPCOMING' | 'COMPLETED' | 'ALL'
  specialty?: string
  searchQuery?: string
}

export interface FollowUpSummaryStats {
  needsAttentionCount: number
  upcomingCount: number
  completedCount: number
  totalCount: number
}
