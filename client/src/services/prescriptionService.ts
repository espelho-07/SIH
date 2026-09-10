import type {
  DigitalPrescription,
  MedicineItem,
  MedicineInventoryLocation,
} from '@/types/prescription'

const PRESCRIPTIONS_STORAGE_KEY = 'healthconnect_digital_prescriptions_v1'

const SEED_PRESCRIPTIONS: DigitalPrescription[] = [
  {
    id: 'rx-001',
    prescriptionCode: 'RX-2026-8921',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    abhaId: '14-8842-1920-5531',
    facilityId: 'fac-shivpur-chc',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    facilityTier: 'CHC',
    departmentName: 'Emergency Triage & Outpatient Unit',
    prescribingDoctorName: 'Dr. Priya Tripathi',
    prescribingDoctorSpecialty: 'General Medicine & Family Health',
    doctorRegistrationNumber: 'UP-MC-67381',
    prescribedAtIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    diagnosisDescription: 'Angina Pectoris / Suspected Unstable Coronary Ischemia (ICD-10 I20.0)',
    clinicalIndication: 'Immediate secondary prevention loading and long-term lipid stabilization',
    medicines: [
      {
        id: 'med-001',
        medicineName: 'Tab. Atorvastatin 20mg',
        genericName: 'Atorvastatin',
        strength: '20 mg',
        dosageForm: 'TABLET',
        schedule: {
          morning: 0,
          afternoon: 0,
          night: 1,
          timing: 'BEDTIME',
          label: '0-0-1 (Once daily at bedtime after food)',
        },
        durationDays: 30,
        startDateIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        instructions: 'Take strictly after dinner with water. Avoid grapefruit juice or excessive caffeine.',
        prescribedQuantity: 30,
        refillsTotal: 3,
        refillsRemaining: 2,
        status: 'ACTIVE',
        isGenericAvailable: true,
        janAushadhiSku: 'JA-CARD-042',
      },
      {
        id: 'med-002',
        medicineName: 'Tab. Aspirin (Ecosprin) 75mg',
        genericName: 'Aspirin (Enteric Coated)',
        strength: '75 mg',
        dosageForm: 'TABLET',
        schedule: {
          morning: 0,
          afternoon: 1,
          night: 0,
          timing: 'AFTER_FOOD',
          label: '0-1-0 (Once daily after lunch)',
        },
        durationDays: 30,
        startDateIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        instructions: 'Take strictly after lunch with a full glass of water. Do not crush or chew enteric coated tablet.',
        prescribedQuantity: 30,
        refillsTotal: 3,
        refillsRemaining: 2,
        status: 'ACTIVE',
        isGenericAvailable: true,
        janAushadhiSku: 'JA-CARD-018',
      },
      {
        id: 'med-003',
        medicineName: 'Tab. Telmisartan 40mg',
        genericName: 'Telmisartan',
        strength: '40 mg',
        dosageForm: 'TABLET',
        schedule: {
          morning: 1,
          afternoon: 0,
          night: 0,
          timing: 'AFTER_FOOD',
          label: '1-0-0 (Once daily in morning after breakfast)',
        },
        durationDays: 60,
        startDateIso: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
        instructions: 'Take at the same fixed hour every morning. Monitor blood pressure twice weekly in resting state.',
        prescribedQuantity: 60,
        refillsTotal: 4,
        refillsRemaining: 3,
        status: 'ACTIVE',
        isGenericAvailable: true,
        janAushadhiSku: 'JA-HYP-109',
      },
    ],
    isDispensed: true,
    dispensedAtIso: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    dispensingPharmacyName: 'Pradhan Mantri Bhartiya Janaushadhi Pendra (Pandeypur Hub)',
    dispensingPharmacistName: 'Pharmacist Suresh Chandra (Reg. 44102)',
    dispensationNotes: 'Full 30-day generic kit dispensed at zero patient cost under Ayushman Bharat PM-JAY entitlement.',
    safetyNotice:
      'Take all medicines strictly as directed. Do not alter dosages without consulting your prescribing physician. Janaushadhi bioequivalent formulations are verified by CDSCO standard.',
  },
  {
    id: 'rx-002',
    prescriptionCode: 'RX-2026-6412',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    abhaId: '14-8842-1920-5531',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    departmentName: 'General Medicine OPD-102',
    prescribingDoctorName: 'Dr. Anand Verma',
    prescribingDoctorSpecialty: 'Senior Consultant Physician',
    doctorRegistrationNumber: 'UP-MC-41982',
    prescribedAtIso: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
    diagnosisDescription: 'Essential Primary Hypertension (ICD-10 I10)',
    clinicalIndication: 'Blood pressure control and cardiovascular risk reduction',
    medicines: [
      {
        id: 'med-004',
        medicineName: 'Tab. Amlodipine 5mg',
        genericName: 'Amlodipine Besylate',
        strength: '5 mg',
        dosageForm: 'TABLET',
        schedule: {
          morning: 0,
          afternoon: 0,
          night: 1,
          timing: 'BEDTIME',
          label: '0-0-1 (Once daily at night)',
        },
        durationDays: 30,
        startDateIso: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
        instructions: 'Discontinued and replaced by Telmisartan 40mg upon physician review.',
        prescribedQuantity: 30,
        refillsTotal: 0,
        refillsRemaining: 0,
        status: 'DISCONTINUED',
        isGenericAvailable: true,
        janAushadhiSku: 'JA-HYP-005',
      },
    ],
    isDispensed: true,
    dispensedAtIso: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
    dispensingPharmacyName: 'District Hospital Central Pharmacy Counter #02',
    dispensingPharmacistName: 'Pharmacist R. K. Singh',
    dispensationNotes: 'Previous course completed.',
    safetyNotice: 'Discontinued medication. Do not consume remaining tablets.',
  },
]

const MOCK_MEDICINE_INVENTORY: MedicineInventoryLocation[] = [
  {
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Central Pharmacy Counter #02',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityType: 'DISTRICT_HOSPITAL_PHARMACY',
    address: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    distanceKm: 3.8,
    estimatedTravelTimeMins: 14,
    phone: '+91 542 250 2841',
    operatingHours: '24x7 Inpatient & Emergency • OPD Pharmacy: 08:00 AM - 02:00 PM',
    medicineName: 'Tab. Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    strength: '20 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 240,
    isAyushmanFree: true,
    mrpInr: 0,
    marketEquivalentPriceInr: 140,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
  },
  {
    facilityId: 'fac-jan-aushadhi-pandeypur',
    facilityName: 'Pradhan Mantri Bhartiya Janaushadhi Kendra (Pandeypur Hub)',
    facilityTier: 'PHC',
    facilityType: 'JAN_AUSHADHI',
    address: 'Shop 4, Opp. District Hospital Gate, Pandeypur, Varanasi 221002',
    distanceKm: 3.9,
    estimatedTravelTimeMins: 15,
    phone: '+91 94152 88410',
    operatingHours: '08:00 AM - 09:00 PM (All 7 Days)',
    medicineName: 'Tab. Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    strength: '20 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 480,
    isAyushmanFree: true,
    mrpInr: 14,
    marketEquivalentPriceInr: 140,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    isStale: false,
    freshnessLabel: 'Updated 25 min ago',
  },
  {
    facilityId: 'fac-shivpur-chc',
    facilityName: 'CHC Shivpur Jan Aushadhi & Drug Dispensing Counter',
    facilityTier: 'CHC',
    facilityType: 'CHC_PHARMACY',
    address: 'Airport Road, Shivpur, Varanasi, UP 221003',
    distanceKm: 2.1,
    estimatedTravelTimeMins: 8,
    phone: '+91 542 228 1145',
    operatingHours: '08:30 AM - 02:00 PM',
    medicineName: 'Tab. Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    strength: '20 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 120,
    isAyushmanFree: true,
    mrpInr: 0,
    marketEquivalentPriceInr: 140,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    isStale: false,
    freshnessLabel: 'Updated 42 min ago',
  },
  {
    facilityId: 'fac-bhu-amrit',
    facilityName: 'Sir Sunderlal Hospital (IMS BHU) AMRIT Pharmacy',
    facilityTier: 'TERTIARY_AIIMS',
    facilityType: 'JAN_AUSHADHI',
    address: 'Ground Floor, SSH Main Building, BHU Campus, Varanasi 221005',
    distanceKm: 9.4,
    estimatedTravelTimeMins: 28,
    phone: '+91 542 230 7500',
    operatingHours: '24x7 (Open All Days)',
    medicineName: 'Tab. Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    strength: '20 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 950,
    isAyushmanFree: true,
    mrpInr: 14,
    marketEquivalentPriceInr: 140,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    isStale: false,
    freshnessLabel: 'Updated 12 min ago',
  },
  {
    facilityId: 'fac-varanasi-dh',
    facilityName: 'District Hospital Central Pharmacy Counter #02',
    facilityTier: 'DISTRICT_HOSPITAL',
    facilityType: 'DISTRICT_HOSPITAL_PHARMACY',
    address: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
    distanceKm: 3.8,
    estimatedTravelTimeMins: 14,
    phone: '+91 542 250 2841',
    operatingHours: '24x7 Inpatient & Emergency',
    medicineName: 'Tab. Aspirin (Ecosprin) 75mg',
    genericName: 'Aspirin (Enteric Coated)',
    strength: '75 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 310,
    isAyushmanFree: true,
    mrpInr: 0,
    marketEquivalentPriceInr: 45,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 18 min ago',
  },
  {
    facilityId: 'fac-jan-aushadhi-pandeypur',
    facilityName: 'Pradhan Mantri Bhartiya Janaushadhi Kendra (Pandeypur Hub)',
    facilityTier: 'PHC',
    facilityType: 'JAN_AUSHADHI',
    address: 'Shop 4, Opp. District Hospital Gate, Pandeypur, Varanasi 221002',
    distanceKm: 3.9,
    estimatedTravelTimeMins: 15,
    phone: '+91 94152 88410',
    operatingHours: '08:00 AM - 09:00 PM (All 7 Days)',
    medicineName: 'Tab. Telmisartan 40mg',
    genericName: 'Telmisartan',
    strength: '40 mg',
    dosageForm: 'TABLET',
    availabilityStatus: 'IN_STOCK',
    unitsAvailable: 280,
    isAyushmanFree: true,
    mrpInr: 18,
    marketEquivalentPriceInr: 160,
    lastUpdatedIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isStale: false,
    freshnessLabel: 'Updated 25 min ago',
  },
]

class PrescriptionService {
  private getStorage(): DigitalPrescription[] {
    try {
      const stored = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // fallback
    }
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(SEED_PRESCRIPTIONS))
    return SEED_PRESCRIPTIONS
  }

  /**
   * Retrieves all digital prescriptions for the active citizen.
   */
  async getPrescriptions(): Promise<DigitalPrescription[]> {
    return this.getStorage()
  }

  /**
   * Retrieves an individual prescription by prescription code or ID.
   */
  async getPrescriptionById(id: string): Promise<DigitalPrescription | null> {
    const list = this.getStorage()
    return list.find((p) => p.id === id || p.prescriptionCode === id) || null
  }

  /**
   * Retrieves all active medications across all active prescriptions.
   */
  async getActiveMedications(): Promise<MedicineItem[]> {
    const list = this.getStorage()
    const activePrescriptions = list.filter((p) => p.medicines.some((m) => m.status === 'ACTIVE'))
    const activeMeds: MedicineItem[] = []

    for (const rx of activePrescriptions) {
      for (const med of rx.medicines) {
        if (med.status === 'ACTIVE') {
          activeMeds.push(med)
        }
      }
    }

    return activeMeds
  }

  /**
   * Searches public pharmacy stock for a given medicine name or generic compound.
   */
  async searchMedicineAvailability(searchQuery: string): Promise<MedicineInventoryLocation[]> {
    if (!searchQuery.trim()) {
      return MOCK_MEDICINE_INVENTORY
    }

    const q = searchQuery.toLowerCase()
    return MOCK_MEDICINE_INVENTORY.filter(
      (loc) =>
        loc.medicineName.toLowerCase().includes(q) ||
        loc.genericName.toLowerCase().includes(q) ||
        loc.facilityName.toLowerCase().includes(q),
    )
  }
}

export const prescriptionService = new PrescriptionService()
