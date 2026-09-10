export type FacilityTier = 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'SUB_CENTRE' | 'TERTIARY_AIIMS'

export type FacilityOwnership = 'GOVERNMENT' | 'PRIVATE_EMPANELED'

export type OperationalStatus = 'OPERATIONAL' | 'OVERLOADED' | 'DISRUPTED' | 'MAINTENANCE'

export interface BedCensus {
  total: number
  available: number
  occupied: number
  reserved: number
}

export interface DoctorProfile {
  id: string
  name: string
  specialty: string
  qualification: string
  roomNumber: string
  isAvailableNow: boolean
  dutyHours: string
}

export interface ClinicalDepartment {
  id: string
  name: string
  opdTimings: string
  doctorsOnDuty: DoctorProfile[]
}

export interface DiagnosticEquipment {
  name: string
  status: 'OPERATIONAL' | 'LIMITED' | 'UNDER_MAINTENANCE'
  turnaroundTimeMins?: number
  lastTested: string
}

export interface FacilityTelemetry {
  id: string
  name: string
  ownership: FacilityOwnership
  tier: FacilityTier
  district: string
  state: string
  address: string
  pincode?: string
  distanceKm?: number
  estimatedTravelTimeMins?: number
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

export interface FacilityDetail extends FacilityTelemetry {
  phone: string
  emergencyHelpline: string
  operatingHours: string
  departments: ClinicalDepartment[]
  diagnosticEquipment: DiagnosticEquipment[]
  medicineStockPercentage: number
  commonMedicinesAvailable: string[]
  bloodBankDetails: {
    isLive: boolean
    totalUnits: number
    groups: Record<string, number>
  }
  liveQueueOverview: {
    currentServingToken: string
    totalWaiting: number
    averageWaitMins: number
  }
}

export interface TreatmentMatchResult {
  facility: FacilityTelemetry
  matchScore: number
  capabilityMatched: boolean
  recommendedReason: string
  estimatedTravelTimeMins: number
  rationaleChecklist: string[]
  missingCapabilities?: string[]
}

export interface FacilityFilterParams {
  query?: string
  ownership?: 'ALL' | 'GOVERNMENT' | 'PRIVATE'
  tier?: 'ALL' | FacilityTier
  specialty?: string
  maxDistanceKm?: number
  hasIcuAvailable?: boolean
  hasOxygenAvailable?: boolean
  hasEmergency24x7?: boolean
  isAyushmanEmpaneled?: boolean
  sortBy?: 'RECOMMENDED' | 'DISTANCE' | 'AVAILABLE_BEDS'
}
