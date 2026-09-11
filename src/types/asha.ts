import { Vitals } from './clinical';

export interface AshaPatient {
  id: string;
  ashaId: string;
  ashaName: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  village: string;
  wardNumber?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  abhaId?: string;
  isHighRisk: boolean;
  highRiskReasons?: string[];
  registeredOffline?: boolean;
  lastVisitDate?: string;
  nextFollowUpDate?: string;
  latestVitals?: Vitals;
  category?: 'MATERNAL' | 'INFANT' | 'NCD_HYPERTENSION' | 'NCD_DIABETES' | 'ELDERLY' | 'GENERAL';
  createdAt: string;
}

export type ScreeningCategory = 'MATERNAL' | 'CHILD' | 'NCD' | 'GENERAL';

export interface ScreeningAnswer {
  questionId: string;
  questionText: string;
  answer: boolean | string | number;
  flagRaised?: boolean;
}

export interface ScreeningSession {
  id: string;
  patientId: string;
  patientName: string;
  category: ScreeningCategory;
  conductedBy: string;
  conductedAt: string;
  answers: ScreeningAnswer[];
  riskFlags: string[];
  riskScore: 'LOW' | 'MODERATE' | 'HIGH';
  recommendedNextAction: string;
  clinicianVerificationRequired: true;
  synced: boolean;
}

export interface AshaVisit {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  purpose: string;
  notes: string;
  vitalsRecorded?: Vitals;
  screeningConducted?: boolean;
  requiresReferral?: boolean;
  isCompleted: boolean;
}

export interface OfflineSyncItem {
  id: string;
  entityType: 'PATIENT_REGISTRATION' | 'VITALS' | 'SCREENING' | 'VISIT_NOTE';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCED' | 'CONFLICT' | 'FAILED';
  errorDetails?: string;
}
