import type { FacilityTier, FacilityOwnership, BedCensus } from './facility'

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type BloodComponent = 'WHOLE_BLOOD' | 'PRBC' | 'PLATELETS' | 'FFP'

export interface EmergencyContact {
  id: string
  helplineNumber: string
  title: string
  subtitle: string
  description: string
  isNational: boolean
  isTollFree: boolean
  primaryBadge: string
  iconName: string
  availability: string
}

export interface EmergencyFacility {
  id: string
  name: string
  ownership: FacilityOwnership
  tier: FacilityTier
  address: string
  distanceKm: number
  estimatedTravelTimeMins: number
  phone: string
  emergencyHelpline: string
  operatingHours: string
  hasEmergency24x7: boolean
  hasTraumaCenter: boolean
  operationalStatus: 'OPERATIONAL' | 'OVERLOADED' | 'DISRUPTED'
  icuBeds: BedCensus
  oxygenBeds: BedCensus
  bloodBankAvailable: boolean
  bloodUnitsTotal: number
  lastUpdatedIso: string
  isStale: boolean
  freshnessLabel: string
  onDutyEmergencyDoctor: string
}

export interface BloodStockItem {
  id: string
  facilityId: string
  facilityName: string
  facilityTier: FacilityTier
  address: string
  distanceKm: number
  contactPhone: string
  bloodGroup: BloodGroup
  component: BloodComponent
  unitsAvailable: number
  isLive: boolean
  lastUpdatedIso: string
  isStale: boolean
  freshnessLabel: string
  testingStandard: string
  donationContact: string
}

export type AmbulanceServiceType = 'ALS' | 'BLS' | 'MATERNAL_INFANT' | 'PATIENT_TRANSPORT'

export interface AmbulanceFleetInfo {
  id: string
  providerName: string
  serviceType: AmbulanceServiceType
  typeLabel: string
  coverageDistrict: string
  dispatchHelpline: string
  operatingHours: string
  isZeroChargeGuaranteed: boolean
  schemeName: string
  capabilities: string[]
  dispatchNote: string
  onboardEquipment: string[]
  triageInstruction: string
}

export interface RedFlagSymptom {
  id: string
  symptom: string
  clinicalRisk: string
  immediateAction: string
  recommendedFacilityType: string
}
