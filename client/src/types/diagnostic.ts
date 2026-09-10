/**
 * HealthConnect Domain: Diagnostics, Laboratory Investigations & Imaging
 * Aligned with FHIR R4 DiagnosticReport / ServiceRequest and ABDM specifications.
 */

export type DiagnosticOrderStatus =
  | 'ORDERED'                     // Requisition created by medical officer
  | 'APPOINTMENT_NEEDED'          // Patient needs to select date/facility
  | 'SAMPLE_COLLECTION_PENDING'   // Collection scheduled; awaiting specimen draw / ECG
  | 'SAMPLE_COLLECTED'            // Specimen drawn and barcoded at phlebotomy desk
  | 'PROCESSING'                  // Specimen in analyzer / examination in progress
  | 'REPORT_READY'                // Results authorized by lab technician / pathologist
  | 'REVIEWED'                    // Reviewed by prescribing clinician with observation note
  | 'CANCELLED'                   // Order cancelled by physician or patient

export type DiagnosticCategory =
  | 'CARDIOLOGY'                  // 12-Lead ECG, Echocardiography, Troponin
  | 'PATHOLOGY_BIOCHEMISTRY'      // Blood panels, Liver/Kidney function, Lipids, Glycemia
  | 'RADIOLOGY_IMAGING'           // Digital X-Ray, Ultrasound, CT scan
  | 'HEMATOLOGY'                  // Complete Blood Count (CBC), ESR, Coagulation
  | 'MICROBIOLOGY'                // Sputum smear, urine routine, culture

export type DiagnosticPriority =
  | 'ROUTINE'                     // Scheduled within standard clinical SLA (24-48 hrs)
  | 'URGENT'                      // Priority processing within 4 hours
  | 'STAT_EMERGENCY'              // Immediate life-critical triage (<=30 mins)

export interface DiagnosticResultItem {
  testName: string
  category: DiagnosticCategory
  resultValue: string
  unit?: string
  referenceInterval?: string
  methodologyNotice?: string
  verifiedByDoctor?: string
}

export interface DiagnosticReport {
  id: string
  orderId: string
  orderCode: string
  testName: string
  category: DiagnosticCategory
  facilityId: string
  facilityName: string
  facilityTier: string
  departmentName: string
  specimenType?: string
  collectedAtIso?: string
  releasedAtIso: string
  verifiedByDoctorName: string
  verifiedByDoctorRegistration: string
  labTechnicianName?: string
  analyzerEquipment?: string
  results: DiagnosticResultItem[]
  clinicianNote?: string // Authorized physician observation; never generated autonomously
  safetyDisclaimer: string
  documentRef?: string
}

export interface DiagnosticOrder {
  id: string
  orderCode: string // e.g. "DX-2026-4410"
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  abhaId: string

  testName: string
  testCategory: DiagnosticCategory
  clinicalIndication: string
  priority: DiagnosticPriority
  status: DiagnosticOrderStatus

  orderingFacilityId: string
  orderingFacilityName: string
  orderingFacilityTier: string
  orderingDoctorName: string
  orderingDoctorSpecialty: string
  doctorRegistrationNumber: string
  orderedAtIso: string

  patientPreparationInstructions?: string[] // e.g. ["12-hour overnight fasting required", "Water permitted"]
  sampleType?: string // e.g. "Venous Blood", "12-Lead Electrocardiogram", "Digital Radiograph"

  // Scheduling & Sample Collection
  scheduledFacilityId?: string
  scheduledFacilityName?: string
  scheduledDate?: string
  scheduledTimeSlot?: string
  sampleCollectedAtIso?: string
  phlebotomistName?: string

  // Linked Queue & Hospital Referral
  linkedQueueTokenId?: string
  linkedQueueTokenNumber?: string // e.g. "D-018"
  linkedReferralId?: string
  linkedReferralCode?: string // e.g. "REF-2026-9041"

  // Report details
  reportId?: string
  reportAvailableAtIso?: string
  reportSummarySnippet?: string

  // Action flow
  patientActionRequired: boolean
  nextActionInstruction: string
  actionRoute?: string
}

export interface DiagnosticFacilityMatch {
  facilityId: string
  facilityName: string
  facilityTier: string
  address: string
  distanceKm: number
  estimatedTravelTimeMins: number
  isGovernment: boolean
  isAyushmanEmpaneled: boolean
  equipmentName: string
  equipmentOperationalStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'OFFLINE'
  turnaroundTimeHours: number
  sampleCollectionHours: string
  hasOpenSlotsToday: boolean
  nextAvailableSlot: string
  costSubsidized: boolean // 100% free in public facilities under NHM
}
