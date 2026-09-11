export type RiskLevel = 'NORMAL' | 'NEEDS_ATTENTION' | 'HIGH_RISK';

export interface Vitals {
  id?: string;
  patientId: string;
  encounterId?: string;
  recordedBy: string;
  recordedByRole: string;
  recordedAt: string;
  systolicBp?: number;
  diastolicBp?: number;
  pulseRate?: number;
  temperatureF?: number;
  bloodSugarMgDl?: number;
  sugarType?: 'FASTING' | 'POST_PRANDIAL' | 'RANDOM';
  spO2?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  riskLevel: RiskLevel;
  riskFlags?: string[];
  notes?: string;
}

export interface Diagnosis {
  id: string;
  encounterId: string;
  patientId: string;
  icdCode?: string;
  conditionName: string;
  type: 'PROVISIONAL' | 'CONFIRMED' | 'DIFFERENTIAL';
  notes?: string;
  diagnosedBy: string;
  diagnosedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "1-0-1 (Twice daily after meals)"
  duration: string; // e.g. "5 days"
  route: string; // "Oral"
  instructions?: string;
  dispensedStatus: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED';
  dispensedQuantity?: number;
  totalQuantity: number;
}

export interface Prescription {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  issuedAt: string;
  diagnosisSummary: string;
  items: PrescriptionItem[];
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED';
  pharmacyNotes?: string;
}

export type DiagnosticOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DiagnosticOrder {
  id: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  testCategory: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'RADIOLOGY' | 'MICROBIOLOGY' | 'PATHOLOGY';
  orderedBy: string;
  orderedAt: string;
  facilityId: string;
  facilityName: string;
  status: DiagnosticOrderStatus;
  sampleCollectedAt?: string;
  processedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  reportFileUrl?: string;
  isAbnormal?: boolean;
  notes?: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  type: 'OPD' | 'TELECONSULT' | 'EMERGENCY' | 'FIELD_VISIT';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'REFERRED';
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  clinicalNotes?: string;
  vitals?: Vitals;
  diagnoses: Diagnosis[];
  prescriptions: PrescriptionItem[];
  diagnosticOrders: DiagnosticOrder[];
  referralId?: string;
  startedAt: string;
  completedAt?: string;
}

export interface PatientHealthRecord {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  abhaId?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  timeline: Array<{
    id: string;
    date: string;
    eventType: 'ENCOUNTER' | 'VITALS' | 'DIAGNOSIS' | 'PRESCRIPTION' | 'LAB_REPORT' | 'REFERRAL' | 'FOLLOW_UP';
    title: string;
    facilityName: string;
    doctorName?: string;
    summary: string;
    details?: Record<string, unknown>;
  }>;
}
