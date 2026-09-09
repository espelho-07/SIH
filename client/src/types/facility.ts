export type FacilityTier = 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'SUB_CENTRE' | 'TERTIARY_AIIMS'

export type OperationalStatus = 'OPERATIONAL' | 'OVERLOADED' | 'DISRUPTED' | 'MAINTENANCE'

export interface BedCensus {
  total: number
  available: number
  occupied: number
  reserved: number
}

export interface FacilityTelemetry {
  id: string
  name: string
  tier: FacilityTier
  district: string
  state: string
  address: string
  distanceKm?: number
  isAyushmanEmpaneled: boolean
  hasEmergency24x7: boolean
  operationalStatus: OperationalStatus
  icuBeds: BedCensus
  oxygenBeds: BedCensus
  generalBeds: BedCensus
  specialistsOnDuty: Array<{
    name: string
    specialty: string
    isAvailableNow: boolean
  }>
  bloodUnitsAvailable: number
  lastUpdatedIso: string
  isStale: boolean
}

export interface TreatmentMatchResult {
  facility: FacilityTelemetry
  matchScore: number
  capabilityMatched: boolean
  recommendedReason: string
  estimatedTravelTimeMins: number
}
