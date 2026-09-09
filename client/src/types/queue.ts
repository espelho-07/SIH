export type QueuePriority = 'EMERGENCY' | 'SENIOR_CITIZEN' | 'MATERNAL' | 'GENERAL'

export type TokenStatus = 'ISSUED' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'

export interface ActiveToken {
  id: string
  tokenNumber: string
  facilityId: string
  facilityName: string
  departmentName: string
  doctorName: string
  roomNumber: string
  status: TokenStatus
  priority: QueuePriority
  currentServingToken: string
  positionInQueue: number
  estimatedWaitMinutes: number
  delayReason?: string
  issuedAtIso: string
}
