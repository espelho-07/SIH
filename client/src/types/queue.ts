export type QueuePriority = 'EMERGENCY' | 'SENIOR_CITIZEN' | 'MATERNAL' | 'GENERAL'

export type QueuePatientState =
  | 'NOT_CHECKED_IN'
  | 'WAITING'
  | 'APPROACHING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED'

export type TokenStatus = 'ISSUED' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'

export type VisitType = 'OPD_CONSULTATION' | 'DIAGNOSTICS_LAB' | 'PHARMACY'

export interface ActiveToken {
  id: string
  appointmentId?: string
  referenceNumber?: string // Linked appointment ref, e.g. "APT-2026-8492"
  tokenNumber: string      // e.g. "B-042"
  facilityId: string
  facilityName: string
  facilityAddress?: string
  departmentName: string
  doctorName: string
  doctorSpecialty?: string
  roomNumber: string       // e.g. "Room OPD-102"
  state: QueuePatientState
  status: TokenStatus      // Kept for backward compatibility
  priority: QueuePriority
  visitType: VisitType
  currentServingToken: string // e.g. "B-031"
  positionInQueue: number     // People ahead
  totalWaiting: number        // Total active in queue
  estimatedWaitMinutes: number
  estimatedWaitRange: string  // e.g. "25–35 min"
  isDelayed: boolean
  delayReason?: string
  delayMinutes?: number
  isPaused: boolean
  pauseReason?: string
  nextActionInstruction: string
  checkedInAtIso: string
  calledAtIso?: string
  completedAtIso?: string
  lastUpdatedIso: string
}

export interface QueueHistoryItem {
  id: string
  date: string
  tokenNumber: string
  facilityName: string
  departmentName: string
  doctorName: string
  roomNumber: string
  outcome: 'COMPLETED' | 'CANCELLED' | 'MISSED'
  completedAtIso: string
  prescriptionAvailable?: boolean
}
