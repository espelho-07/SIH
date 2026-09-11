export type ReferralStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'APPOINTMENT_CONFIRMED'
  | 'PATIENT_ARRIVED'
  | 'CONSULTED'
  | 'OUTCOME_RECORDED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REROUTED';

export type ReferralPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface ReferralEvent {
  id: string;
  status: ReferralStatus;
  timestamp: string;
  actorName: string;
  actorRole: string;
  facilityName: string;
  notes?: string;
}

export interface Referral {
  id: string;
  referralCode: string; // e.g. "REF-2026-0891"
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  abhaId?: string;
  
  // Origin
  fromFacilityId: string;
  fromFacilityName: string;
  fromDoctorId: string;
  fromDoctorName: string;
  
  // Destination
  toFacilityId: string;
  toFacilityName: string;
  toSpecialty: string;
  toDoctorId?: string;
  toDoctorName?: string;
  
  // Clinical Context
  reasonForReferral: string;
  clinicalSummary: string;
  priority: ReferralPriority;
  requiredEquipment?: string[];
  requiredIcu?: boolean;
  
  // Status & SLA
  status: ReferralStatus;
  slaDeadline: string; // ISO date-time
  slaBreached: boolean;
  appointmentSlot?: string;
  rejectionReason?: string;
  reroutedFromFacilityName?: string;
  clinicalOutcomeNotes?: string;
  
  // Timeline events
  events: ReferralEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferralRequest {
  patientId: string;
  toFacilityId: string;
  toSpecialty: string;
  reasonForReferral: string;
  clinicalSummary: string;
  priority: ReferralPriority;
  requiredEquipment?: string[];
  requiredIcu?: boolean;
}
