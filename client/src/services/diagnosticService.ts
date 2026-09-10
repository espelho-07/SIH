import type {
  DiagnosticOrder,
  DiagnosticReport,
  DiagnosticFacilityMatch,
} from '@/types/diagnostic'

const DIAGNOSTIC_ORDERS_STORAGE_KEY = 'healthconnect_diagnostic_orders_v1'
const DIAGNOSTIC_REPORTS_STORAGE_KEY = 'healthconnect_diagnostic_reports_v1'

const SEED_REPORTS: DiagnosticReport[] = [
  {
    id: 'rep-001',
    orderId: 'dx-001',
    orderCode: 'DX-2026-9041',
    testName: '12-Lead Electrocardiogram (ECG) & STAT Cardiac Troponin-T',
    category: 'CARDIOLOGY',
    facilityId: 'fac-shivpur-chc',
    facilityName: 'Community Health Centre (CHC) Shivpur',
    facilityTier: 'CHC',
    departmentName: 'Emergency & Triage Room',
    specimenType: '12-Lead Surface ECG & Capillary Venous Blood',
    collectedAtIso: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    releasedAtIso: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
    verifiedByDoctorName: 'Dr. Priya Tripathi',
    verifiedByDoctorRegistration: 'UP-MC-67381',
    labTechnicianName: 'Technician Rajesh Maurya',
    analyzerEquipment: 'BPL Cardiart 9108D & Roche Cobas h232 Analyzer',
    results: [
      {
        testName: '12-Lead Surface Electrocardiogram',
        category: 'CARDIOLOGY',
        resultValue: 'Sinus Rhythm, ST-segment depression in V3-V5 (1.5 mm)',
        referenceInterval: 'Normal sinus rhythm, isoelectric ST segment, no pathological Q waves',
        methodologyNotice: 'Calibrated at 25 mm/s, 10 mm/mV standard voltage.',
        verifiedByDoctor: 'Dr. Priya Tripathi',
      },
      {
        testName: 'Cardiac Troponin-T (Point-of-Care Quantitative)',
        category: 'CARDIOLOGY',
        resultValue: '0.12',
        unit: 'ng/mL',
        referenceInterval: '< 0.04 ng/mL',
        methodologyNotice: 'Quantitative sandwich immunochromatographic assay on Roche Cobas h232.',
        verifiedByDoctor: 'Dr. Priya Tripathi',
      },
    ],
    clinicianNote:
      'Attending Medical Officer Dr. Priya Tripathi: Electrocardiographic tracing demonstrates acute anterior repolarization variation accompanied by positive cardiac troponin elevation. Immediate antiplatelet loading dose administered and tertiary inter-facility referral initiated to Sir Sunderlal Hospital (IMS BHU) Cath Lab.',
    safetyDisclaimer:
      'These diagnostic measurements are recorded for your physician’s review. HealthConnect does not autonomously evaluate medical severity or generate independent diagnostic decisions. Please review all findings with your consulting cardiologist.',
    documentRef: 'DOC-DX-2026-9041.pdf',
  },
  {
    id: 'rep-002',
    orderId: 'dx-002',
    orderCode: 'DX-2026-7822',
    testName: 'Fasting Blood Glucose & Comprehensive Lipid Profile',
    category: 'PATHOLOGY_BIOCHEMISTRY',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    departmentName: 'Central Pathology Laboratory',
    specimenType: 'Venous Plasma (Fluoride & Serum Gel Vacutainer)',
    collectedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    releasedAtIso: new Date(Date.now() - 9.8 * 86400 * 1000).toISOString(),
    verifiedByDoctorName: 'Dr. Manisha Rao',
    verifiedByDoctorRegistration: 'UP-MC-88219',
    labTechnicianName: 'Senior Technician Alka Verma',
    analyzerEquipment: 'Erba EM-200 Fully Automated Clinical Chemistry Analyzer',
    results: [
      {
        testName: 'Fasting Plasma Glucose (GOD-POD)',
        category: 'PATHOLOGY_BIOCHEMISTRY',
        resultValue: '118',
        unit: 'mg/dL',
        referenceInterval: '70–100 mg/dL (Normal Fasting)',
        methodologyNotice: 'Glucose Oxidase-Peroxidase (GOD-POD) enzymatic method.',
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Serum Total Cholesterol',
        category: 'PATHOLOGY_BIOCHEMISTRY',
        resultValue: '224',
        unit: 'mg/dL',
        referenceInterval: '< 200 mg/dL (Desirable)',
        methodologyNotice: 'CHOD-PAP enzymatic end-point assay.',
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Serum Triglycerides',
        category: 'PATHOLOGY_BIOCHEMISTRY',
        resultValue: '168',
        unit: 'mg/dL',
        referenceInterval: '< 150 mg/dL (Normal)',
        methodologyNotice: 'GPO-PAP enzymatic colorimetric method.',
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Serum HDL Cholesterol (Direct)',
        category: 'PATHOLOGY_BIOCHEMISTRY',
        resultValue: '42',
        unit: 'mg/dL',
        referenceInterval: '> 40 mg/dL (Optimal for Males)',
        methodologyNotice: 'Direct clearance method without precipitation.',
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
      {
        testName: 'Calculated LDL Cholesterol (Friedewald)',
        category: 'PATHOLOGY_BIOCHEMISTRY',
        resultValue: '148',
        unit: 'mg/dL',
        referenceInterval: '< 100 mg/dL (Optimal)',
        methodologyNotice: 'Derived mathematically via standard Friedewald formula.',
        verifiedByDoctor: 'Dr. Manisha Rao',
      },
    ],
    clinicianNote:
      'Chief Clinical Pathologist Dr. Manisha Rao: Fasting values verified on calibrated analyzer. Mild hypercholesterolemia and impaired fasting glycaemia noted. Correlate with physician for lifestyle guidance and ongoing statin compliance.',
    safetyDisclaimer:
      'Diagnostic test values are provided for clinical consultation. HealthConnect never independently determines diabetes or cardiovascular status. Discuss your report with your consulting physician.',
    documentRef: 'DOC-DX-2026-7822.pdf',
  },
  {
    id: 'rep-004',
    orderId: 'dx-004',
    orderCode: 'DX-2026-3390',
    testName: 'Digital X-Ray Right Leg (Tibia-Fibula AP & Lateral)',
    category: 'RADIOLOGY_IMAGING',
    facilityId: 'fac-varanasi-dh',
    facilityName: 'Pandit Deendayal Upadhyay District Hospital',
    facilityTier: 'DISTRICT_HOSPITAL',
    departmentName: 'Department of Radiodiagnosis & Imaging',
    specimenType: 'Digital Radiographic Projection',
    collectedAtIso: new Date(Date.now() - 25 * 86400 * 1000).toISOString(),
    releasedAtIso: new Date(Date.now() - 24.9 * 86400 * 1000).toISOString(),
    verifiedByDoctorName: 'Dr. Alok Srivastava',
    verifiedByDoctorRegistration: 'UP-MC-55912',
    labTechnicianName: 'Radiographer R. P. Singh',
    analyzerEquipment: 'Siemens Multix Impact Digital Radiography System',
    results: [
      {
        testName: 'Right Tibia and Fibula AP/Lateral View',
        category: 'RADIOLOGY_IMAGING',
        resultValue: 'Cortical margins intact. No fracture, dislocation, or periosteal reaction observed.',
        referenceInterval: 'Normal bone mineral density and joint alignment without traumatic disruption.',
        methodologyNotice: 'High-resolution direct digital radiograph (DR).',
        verifiedByDoctor: 'Dr. Alok Srivastava',
      },
    ],
    clinicianNote:
      'Consultant Orthopedic Surgeon Dr. Alok Srivastava: No bony fracture identified on views. Soft tissue contusion managed with immobilization splint; resolved satisfactorily.',
    safetyDisclaimer:
      'Radiological observations are authorized by the certified radiographer and orthopedic specialist. Review with your doctor.',
    documentRef: 'DOC-DX-2026-3390.pdf',
  },
]

const SEED_ORDERS: DiagnosticOrder[] = [
  {
    id: 'dx-001',
    orderCode: 'DX-2026-9041',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    abhaId: '14-8842-1920-5531',
    testName: '12-Lead Electrocardiogram (ECG) & STAT Cardiac Troponin-T',
    testCategory: 'CARDIOLOGY',
    clinicalIndication: 'Acute retrosternal chest tightness radiating to left shoulder on exertion',
    priority: 'STAT_EMERGENCY',
    status: 'REPORT_READY',
    orderingFacilityId: 'fac-shivpur-chc',
    orderingFacilityName: 'Community Health Centre (CHC) Shivpur',
    orderingFacilityTier: 'CHC',
    orderingDoctorName: 'Dr. Priya Tripathi',
    orderingDoctorSpecialty: 'General Medicine & Family Health',
    doctorRegistrationNumber: 'UP-MC-67381',
    orderedAtIso: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    patientPreparationInstructions: [
      'Rest quietly in a supine position for 5 minutes prior to ECG electrode placement.',
      'Inform attending phlebotomist if currently taking blood-thinners (Aspirin/Clopidogrel).',
    ],
    sampleType: '12-Lead Electrocardiogram & Venous Blood',
    sampleCollectedAtIso: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    phlebotomistName: 'Technician Rajesh Maurya',
    linkedReferralId: 'ref-001',
    linkedReferralCode: 'REF-2026-9041',
    linkedQueueTokenId: 'tkn-001',
    linkedQueueTokenNumber: 'B-042',
    reportId: 'rep-001',
    reportAvailableAtIso: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
    reportSummarySnippet: 'ST depression in V3-V5; Troponin-T elevated at 0.12 ng/mL',
    patientActionRequired: true,
    nextActionInstruction: 'Report is ready. Review results and proceed with your accepted tertiary cardiology transfer.',
    actionRoute: '/patient/referrals/ref-001',
  },
  {
    id: 'dx-003',
    orderCode: 'DX-2026-6104',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    abhaId: '14-8842-1920-5531',
    testName: 'Serum Electrolytes (Na+, K+, Cl-) & Serum Creatinine',
    testCategory: 'PATHOLOGY_BIOCHEMISTRY',
    clinicalIndication: 'Pre-treatment renal safety baseline prior to anti-hypertensive titration',
    priority: 'ROUTINE',
    status: 'SAMPLE_COLLECTION_PENDING',
    orderingFacilityId: 'fac-varanasi-dh',
    orderingFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    orderingFacilityTier: 'DISTRICT_HOSPITAL',
    orderingDoctorName: 'Dr. Anand Verma',
    orderingDoctorSpecialty: 'Senior Consultant Physician',
    doctorRegistrationNumber: 'UP-MC-41982',
    orderedAtIso: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    patientPreparationInstructions: [
      'No special dietary fasting needed; well-hydrated state recommended.',
      'Carry test requisition slip to Central Pathology Counter #03.',
    ],
    sampleType: 'Venous Blood (Plain Clot Activator Tube)',
    scheduledFacilityId: 'fac-varanasi-dh',
    scheduledFacilityName: 'Pandit Deendayal Upadhyay District Hospital (Lab Counter 03)',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: '09:00 AM - 12:00 PM',
    linkedQueueTokenId: 'tkn-002',
    linkedQueueTokenNumber: 'D-018',
    patientActionRequired: true,
    nextActionInstruction:
      'Sample collection pending at Lab Counter 03. You are #2 in virtual queue (Token D-018).',
    actionRoute: '/patient/queue/tkn-002',
  },
  {
    id: 'dx-002',
    orderCode: 'DX-2026-7822',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    abhaId: '14-8842-1920-5531',
    testName: 'Fasting Blood Glucose & Comprehensive Lipid Profile',
    testCategory: 'PATHOLOGY_BIOCHEMISTRY',
    clinicalIndication: 'Metabolic surveillance for primary hypertension & dyslipidemia',
    priority: 'ROUTINE',
    status: 'REPORT_READY',
    orderingFacilityId: 'fac-varanasi-dh',
    orderingFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    orderingFacilityTier: 'DISTRICT_HOSPITAL',
    orderingDoctorName: 'Dr. Anand Verma',
    orderingDoctorSpecialty: 'Senior Consultant Physician',
    doctorRegistrationNumber: 'UP-MC-41982',
    orderedAtIso: new Date(Date.now() - 11 * 86400 * 1000).toISOString(),
    sampleType: 'Fasting Venous Plasma',
    sampleCollectedAtIso: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    phlebotomistName: 'Senior Phlebotomist Alka Verma',
    reportId: 'rep-002',
    reportAvailableAtIso: new Date(Date.now() - 9.8 * 86400 * 1000).toISOString(),
    reportSummarySnippet: 'Fasting Glucose 118 mg/dL; Total Cholesterol 224 mg/dL; LDL 148 mg/dL',
    patientActionRequired: false,
    nextActionInstruction: 'Verified report archived in your Ayushman Bharat health record.',
  },
  {
    id: 'dx-004',
    orderCode: 'DX-2026-3390',
    patientId: 'pat-rajesh-sharma',
    patientName: 'Rajesh Sharma',
    patientAge: 48,
    patientGender: 'Male',
    abhaId: '14-8842-1920-5531',
    testName: 'Digital X-Ray Right Leg (Tibia-Fibula AP & Lateral)',
    testCategory: 'RADIOLOGY_IMAGING',
    clinicalIndication: 'Localized right tibia trauma rule-out post curb trip',
    priority: 'ROUTINE',
    status: 'REVIEWED',
    orderingFacilityId: 'fac-varanasi-dh',
    orderingFacilityName: 'Pandit Deendayal Upadhyay District Hospital',
    orderingFacilityTier: 'DISTRICT_HOSPITAL',
    orderingDoctorName: 'Dr. Alok Srivastava',
    orderingDoctorSpecialty: 'Consultant Orthopedic Surgeon',
    doctorRegistrationNumber: 'UP-MC-55912',
    orderedAtIso: new Date(Date.now() - 26 * 86400 * 1000).toISOString(),
    sampleType: 'Digital X-Ray Film',
    sampleCollectedAtIso: new Date(Date.now() - 25 * 86400 * 1000).toISOString(),
    reportId: 'rep-004',
    reportAvailableAtIso: new Date(Date.now() - 24.9 * 86400 * 1000).toISOString(),
    reportSummarySnippet: 'Intact bony architecture; no fracture or dislocation noted.',
    patientActionRequired: false,
    nextActionInstruction: 'Episode completed and reviewed by Dr. Alok Srivastava.',
  },
]

const MOCK_FACILITY_MATCHES: Record<string, DiagnosticFacilityMatch[]> = {
  default: [
    {
      facilityId: 'fac-varanasi-dh',
      facilityName: 'Pandit Deendayal Upadhyay District Hospital',
      facilityTier: 'DISTRICT_HOSPITAL',
      address: 'Pandeypur, Varanasi, Uttar Pradesh 221002',
      distanceKm: 3.8,
      estimatedTravelTimeMins: 14,
      isGovernment: true,
      isAyushmanEmpaneled: true,
      equipmentName: 'Erba EM-200 Fully Automated Clinical Chemistry Analyzer',
      equipmentOperationalStatus: 'OPERATIONAL',
      turnaroundTimeHours: 4,
      sampleCollectionHours: '08:00 AM - 02:00 PM (Daily)',
      hasOpenSlotsToday: true,
      nextAvailableSlot: 'Today • 10:30 AM',
      costSubsidized: true,
    },
    {
      facilityId: 'fac-shivpur-chc',
      facilityName: 'Community Health Centre (CHC) Shivpur',
      facilityTier: 'CHC',
      address: 'Airport Road, Shivpur, Varanasi, UP 221003',
      distanceKm: 2.1,
      estimatedTravelTimeMins: 8,
      isGovernment: true,
      isAyushmanEmpaneled: true,
      equipmentName: 'BPL Cardiart 9108D & Point-of-Care Blood Analyzer',
      equipmentOperationalStatus: 'OPERATIONAL',
      turnaroundTimeHours: 2,
      sampleCollectionHours: '08:30 AM - 01:30 PM',
      hasOpenSlotsToday: true,
      nextAvailableSlot: 'Today • 11:00 AM',
      costSubsidized: true,
    },
    {
      facilityId: 'fac-bhu-ssh',
      facilityName: 'Sir Sunderlal Hospital, IMS BHU',
      facilityTier: 'TERTIARY_AIIMS',
      address: 'BHU Main Campus, Varanasi, Uttar Pradesh 221005',
      distanceKm: 9.4,
      estimatedTravelTimeMins: 28,
      isGovernment: true,
      isAyushmanEmpaneled: true,
      equipmentName: 'Beckman Coulter DxC 700 AU Central Immunoassay Line',
      equipmentOperationalStatus: 'OPERATIONAL',
      turnaroundTimeHours: 6,
      sampleCollectionHours: '24x7 Emergency • Routine: 08:00 AM - 04:00 PM',
      hasOpenSlotsToday: true,
      nextAvailableSlot: 'Today • 12:00 PM',
      costSubsidized: true,
    },
  ],
}

class DiagnosticService {
  private getOrdersStorage(): DiagnosticOrder[] {
    try {
      const stored = localStorage.getItem(DIAGNOSTIC_ORDERS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // fallback
    }
    localStorage.setItem(DIAGNOSTIC_ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS))
    return SEED_ORDERS
  }

  private setOrdersStorage(orders: DiagnosticOrder[]): void {
    try {
      localStorage.setItem(DIAGNOSTIC_ORDERS_STORAGE_KEY, JSON.stringify(orders))
    } catch {
      // ignore
    }
  }

  private getReportsStorage(): DiagnosticReport[] {
    try {
      const stored = localStorage.getItem(DIAGNOSTIC_REPORTS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // fallback
    }
    localStorage.setItem(DIAGNOSTIC_REPORTS_STORAGE_KEY, JSON.stringify(SEED_REPORTS))
    return SEED_REPORTS
  }

  /**
   * Retrieves all diagnostic orders for the patient.
   */
  async getDiagnosticOrders(): Promise<DiagnosticOrder[]> {
    return this.getOrdersStorage()
  }

  /**
   * Retrieves a single diagnostic order by ID.
   */
  async getDiagnosticOrderById(id: string): Promise<DiagnosticOrder | null> {
    const list = this.getOrdersStorage()
    return list.find((o) => o.id === id || o.orderCode === id) || null
  }

  /**
   * Retrieves an authorized laboratory report by Order ID.
   */
  async getReportByOrderId(orderId: string): Promise<DiagnosticReport | null> {
    const reports = this.getReportsStorage()
    return reports.find((r) => r.orderId === orderId || r.orderCode === orderId) || null
  }

  /**
   * Discovers verified public healthcare facilities performing the specified diagnostic investigation.
   */
  async findFacilitiesForTest(_testName: string): Promise<DiagnosticFacilityMatch[]> {
    return MOCK_FACILITY_MATCHES.default
  }

  /**
   * Schedules or confirms sample collection at a selected public health facility.
   */
  async scheduleSampleCollection(
    orderId: string,
    facilityId: string,
    slotTime: string,
  ): Promise<DiagnosticOrder> {
    const list = this.getOrdersStorage()
    const index = list.findIndex((o) => o.id === orderId)
    if (index === -1) {
      throw new Error('Diagnostic order not found.')
    }

    const targetFacility = MOCK_FACILITY_MATCHES.default.find((f) => f.facilityId === facilityId)
    const facilityName = targetFacility ? targetFacility.facilityName : 'District Hospital Laboratory'

    const updated: DiagnosticOrder = {
      ...list[index],
      status: 'SAMPLE_COLLECTION_PENDING',
      scheduledFacilityId: facilityId,
      scheduledFacilityName: facilityName,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTimeSlot: slotTime,
      patientActionRequired: true,
      nextActionInstruction: `Sample collection confirmed at ${facilityName} (${slotTime}). Please arrive with your requisition slip.`,
    }

    list[index] = updated
    this.setOrdersStorage(list)
    return updated
  }

  /**
   * Simulates checking in at the laboratory reception kiosk, returning a live token.
   */
  async checkInForSampleQueue(orderId: string): Promise<{ tokenNumber: string; position: number }> {
    const list = this.getOrdersStorage()
    const index = list.findIndex((o) => o.id === orderId)
    if (index === -1) throw new Error('Order not found.')

    const tokenNumber = `D-0${Math.floor(20 + Math.random() * 40)}`
    const position = Math.floor(2 + Math.random() * 5)

    list[index].linkedQueueTokenNumber = tokenNumber
    list[index].status = 'SAMPLE_COLLECTED'
    list[index].sampleCollectedAtIso = new Date().toISOString()
    list[index].nextActionInstruction = `Sample collected successfully. Processing in progress. Estimated report in 2–4 hours.`
    list[index].patientActionRequired = false

    this.setOrdersStorage(list)
    return { tokenNumber, position }
  }
}

export const diagnosticService = new DiagnosticService()
