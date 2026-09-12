import mongoose, { Schema, Document } from 'mongoose';

// ASHA Patient
export interface IAshaPatient extends Document {
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
  householdId?: string;
  householdHeadName?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  abhaId?: string;
  bloodGroup?: string;
  isHighRisk: boolean;
  highRiskReasons?: string[];
  registeredOffline?: boolean;
  syncStatus?: 'SYNCED' | 'LOCAL_PENDING';
  lastVisitDate?: string;
  nextFollowUpDate?: string;
  latestVitals?: any;
  category?: 'MATERNAL' | 'INFANT' | 'NCD_HYPERTENSION' | 'NCD_DIABETES' | 'ELDERLY' | 'GENERAL';
  gestationalWeek?: number;
  immunizationStage?: string;
  createdAt: string;
}

const AshaPatientSchema = new Schema(
  {
    id: { type: String, index: true },
    ashaId: { type: String, default: 'usr_asha_01' },
    ashaName: { type: String, default: 'Sunita Devi' },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], default: 'F' },
    phone: { type: String, required: true },
    village: { type: String, default: 'Pethapur' },
    wardNumber: { type: String, default: 'Ward 4' },
    address: { type: String, default: 'Near Primary School, Pethapur' },
    householdId: { type: String },
    householdHeadName: { type: String },
    emergencyContactName: { type: String, default: 'Family' },
    emergencyContactPhone: { type: String, default: '9825000000' },
    abhaId: { type: String },
    bloodGroup: { type: String, default: 'B+' },
    isHighRisk: { type: Boolean, default: false },
    highRiskReasons: { type: [String], default: [] },
    registeredOffline: { type: Boolean, default: false },
    syncStatus: { type: String, default: 'SYNCED' },
    lastVisitDate: { type: String },
    nextFollowUpDate: { type: String },
    latestVitals: { type: Schema.Types.Mixed },
    category: { type: String, default: 'GENERAL' },
    gestationalWeek: { type: Number },
    immunizationStage: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ASHA Visit
export interface IAshaVisitDoc extends Document {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  village?: string;
  address?: string;
  visitDate: string;
  timeSlot?: string;
  visitType?: string;
  purpose: string;
  notes: string;
  vitalsRecorded?: any;
  screeningConducted?: boolean;
  requiresReferral?: boolean;
  referralReason?: string;
  actionTaken?: string;
  status?: string;
  isCompleted: boolean;
  completedAt?: string;
  nextScheduledDate?: string;
  prescribedByDoctorName?: string;
  prescribedByDoctorSpecialty?: string;
  prescribedByDoctorFacility?: string;
  prescriptionDate?: string;
  prescribedDays?: number;
  doctorInstructions?: string;
  prescribedChecks?: string[];
  priority?: string;
}

const AshaVisitSchema = new Schema(
  {
    id: { type: String, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    village: { type: String, default: 'Pethapur' },
    address: { type: String },
    visitDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    timeSlot: { type: String, default: '10:00 AM' },
    visitType: { type: String, default: 'ROUTINE_CHECKUP' },
    purpose: { type: String, default: 'Home health checkup' },
    notes: { type: String, default: '' },
    vitalsRecorded: { type: Schema.Types.Mixed },
    screeningConducted: { type: Boolean, default: false },
    requiresReferral: { type: Boolean, default: false },
    referralReason: { type: String },
    actionTaken: { type: String },
    status: { type: String, default: 'SCHEDULED' },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: String },
    nextScheduledDate: { type: String },
    prescribedByDoctorName: { type: String },
    prescribedByDoctorSpecialty: { type: String },
    prescribedByDoctorFacility: { type: String },
    prescriptionDate: { type: String },
    prescribedDays: { type: Number },
    doctorInstructions: { type: String },
    prescribedChecks: { type: [String] },
    priority: { type: String, default: 'ROUTINE' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Follow-up Task
export interface IFollowUpTaskDoc extends Document {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  village: string;
  category: string;
  title: string;
  description: string;
  dueDate: string;
  urgency: string;
  isCompleted: boolean;
  completedAt?: string;
  actionRequired: string;
}

const FollowUpTaskSchema = new Schema(
  {
    id: { type: String, index: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: '9825000000' },
    village: { type: String, default: 'Pethapur' },
    category: { type: String, default: 'NCD' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    urgency: { type: String, default: 'DUE_TODAY' },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: String },
    actionRequired: { type: String, default: 'Conduct home check' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Frontline Referral
export interface IFrontlineReferralDoc extends Document {
  id: string;
  referralNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F' | 'Other';
  patientPhone: string;
  village: string;
  targetFacilityId: string;
  targetFacilityName: string;
  targetFacilityType: string;
  department: string;
  reason: string;
  priority: string;
  ambulanceRequested: boolean;
  ambulanceStatus?: string;
  status: string;
  doctorFeedback?: string;
  createdAt: string;
}

const FrontlineReferralSchema = new Schema(
  {
    id: { type: String, index: true },
    referralNumber: { type: String, required: true, index: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, default: 40 },
    patientGender: { type: String, enum: ['M', 'F', 'Other'], default: 'F' },
    patientPhone: { type: String, default: '9825000000' },
    village: { type: String, default: 'Pethapur' },
    targetFacilityId: { type: String, default: 'fac_civil_01' },
    targetFacilityName: { type: String, default: 'Gandhinagar Civil Hospital' },
    targetFacilityType: { type: String, default: 'DISTRICT_HOSPITAL' },
    department: { type: String, default: 'General Medicine' },
    reason: { type: String, required: true },
    priority: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
    ambulanceRequested: { type: Boolean, default: false },
    ambulanceStatus: { type: String, default: 'NOT_REQUIRED' },
    status: { type: String, default: 'INITIATED' },
    doctorFeedback: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Screening Session
const ScreeningSessionSchema = new Schema(
  {
    id: { type: String, index: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    category: { type: String, default: 'GENERAL' },
    conductedBy: { type: String, default: 'Sunita Devi (ASHA)' },
    conductedAt: { type: String, default: () => new Date().toISOString() },
    answers: { type: [Schema.Types.Mixed], default: [] },
    riskFlags: { type: [String], default: [] },
    riskScore: { type: String, default: 'LOW' },
    recommendedNextAction: { type: String, default: 'Routine monitoring' },
    clinicianVerificationRequired: { type: Boolean, default: true },
    synced: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AshaPatientModel = mongoose.model<IAshaPatient>('AshaPatient', AshaPatientSchema);
export const AshaVisitModel = mongoose.model<IAshaVisitDoc>('AshaVisitModel', AshaVisitSchema);
export const FollowUpTaskModel = mongoose.model<IFollowUpTaskDoc>('FollowUpTask', FollowUpTaskSchema);
export const FrontlineReferralModel = mongoose.model<IFrontlineReferralDoc>('FrontlineReferral', FrontlineReferralSchema);
export const ScreeningSessionModel = mongoose.model('ScreeningSession', ScreeningSessionSchema);
