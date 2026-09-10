/**
 * HealthConnect Domain: Prescriptions, Digital Medications & Public Pharmacy Inventory
 * Aligned with Ayushman Bharat Digital Mission (ABDM) e-Prescription standard and National Essential Drugs List (NLEM).
 */

export type PrescriptionStatus =
  | 'ACTIVE'          // Ongoing medication regimen
  | 'COMPLETED'       // Finished prescribed course
  | 'DISCONTINUED'    // Ceased by physician
  | 'REFILL_DUE'      // Nearing completion of dispensation window

export type MedicineAvailabilityStatus =
  | 'IN_STOCK'        // Adequate verified stock
  | 'LOW_STOCK'       // Less than 20 units remaining
  | 'OUT_OF_STOCK'    // Depleted; awaiting district warehouse replenishment
  | 'UNKNOWN'         // Stale inventory or unverified

export interface DosageSchedule {
  morning: number     // e.g. 1
  afternoon: number   // e.g. 0
  night: number       // e.g. 1
  timing: 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'BEDTIME' | 'AS_NEEDED'
  label: string       // e.g. "1-0-1 (Morning & Night, after meals)"
}

export interface MedicineItem {
  id: string
  medicineName: string        // e.g. "Tab. Atorvastatin 20mg"
  genericName: string         // e.g. "Atorvastatin"
  strength: string            // e.g. "20 mg"
  dosageForm: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'INHALER' | 'OINTMENT'
  schedule: DosageSchedule
  durationDays: number
  startDateIso: string
  endDateIso?: string
  instructions: string        // Exact clinical instructions written by physician
  prescribedQuantity: number  // e.g. 30 tablets
  refillsTotal: number
  refillsRemaining: number
  status: PrescriptionStatus
  isGenericAvailable: boolean // Jan Aushadhi bioequivalent generic exists
  janAushadhiSku?: string
}

export interface DigitalPrescription {
  id: string
  prescriptionCode: string    // e.g. "RX-2026-8921"
  patientId: string
  patientName: string
  abhaId: string

  facilityId: string
  facilityName: string
  facilityTier: string
  departmentName: string

  prescribingDoctorName: string
  prescribingDoctorSpecialty: string
  doctorRegistrationNumber: string
  prescribedAtIso: string

  diagnosisDescription: string
  clinicalIndication: string

  medicines: MedicineItem[]

  // Pharmacy dispensation details
  isDispensed: boolean
  dispensedAtIso?: string
  dispensingPharmacyName?: string
  dispensingPharmacistName?: string
  dispensationNotes?: string

  // Clinical safety disclaimer
  safetyNotice: string
}

export interface MedicineInventoryLocation {
  facilityId: string
  facilityName: string
  facilityTier: string
  facilityType: 'JAN_AUSHADHI' | 'DISTRICT_HOSPITAL_PHARMACY' | 'CHC_PHARMACY' | 'PHC_SUBSTORE'
  address: string
  distanceKm: number
  estimatedTravelTimeMins: number
  phone: string
  operatingHours: string

  medicineName: string
  genericName: string
  strength: string
  dosageForm: string

  availabilityStatus: MedicineAvailabilityStatus
  unitsAvailable: number
  isAyushmanFree: boolean     // 100% cashless under PM-JAY / Jan Aushadhi
  mrpInr: number               // Subsidized Jan Aushadhi price, e.g. ₹12
  marketEquivalentPriceInr: number // Commercial equivalent, e.g. ₹110

  lastUpdatedIso: string
  isStale: boolean             // Stale if > 24 hours without sync
  freshnessLabel: string       // e.g. "Updated 15 min ago"
}
