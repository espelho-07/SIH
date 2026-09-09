export type ReferralStatus =
  | 'SUBMITTED'
  | 'PENDING_CONFIRMATION'
  | 'ACCEPTED_BED_LOCKED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'PATIENT_ARRIVED'
  | 'IN_TREATMENT'
  | 'COMPLETED'
  | 'CANCELLED'

export interface ReferralHandshake {
  id: string
  patientId: string
  patientName: string
  referringFacilityId: string
  referringFacilityName: string
  referringDoctorName: string
  receivingFacilityId: string
  receivingFacilityName: string
  clinicalReason: string
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL_TRAUMA'
  status: ReferralStatus
  bedReservationExpiryIso?: string
  ambulanceDispatched?: boolean
  ambulanceEtaMinutes?: number
  createdAtIso: string
  updatedAtIso: string
}
