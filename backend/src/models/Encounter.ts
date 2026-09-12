import mongoose, { Schema, Document } from 'mongoose';

export interface IEncounter extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  encounterType: 'OPD' | 'EMERGENCY' | 'TELECONSULTATION' | 'REFERRAL';
  chiefComplaints: string[];
  clinicalNotes?: string;
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    bloodGlucose?: number;
    temperature?: number;
    spO2?: number;
    respiratoryRate?: number;
    weight?: number;
  };
  diagnoses?: Array<{
    icdCode?: string;
    conditionName: string;
    type: 'PRIMARY' | 'SECONDARY';
    notes?: string;
  }>;
  prescriptions?: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions?: string;
    isDispensed?: boolean;
  }>;
  diagnostics?: Array<{
    testName: string;
    category: string;
    status: 'ORDERED' | 'COLLECTED' | 'PROCESSED' | 'COMPLETED';
    reportUrl?: string;
  }>;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const EncounterSchema = new Schema<IEncounter>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    encounterType: { type: String, enum: ['OPD', 'EMERGENCY', 'TELECONSULTATION', 'REFERRAL'], default: 'OPD' },
    chiefComplaints: [{ type: String }],
    clinicalNotes: { type: String },
    vitals: {
      bpSystolic: Number,
      bpDiastolic: Number,
      heartRate: Number,
      bloodGlucose: Number,
      temperature: Number,
      spO2: Number,
      respiratoryRate: Number,
      weight: Number,
    },
    diagnoses: [
      {
        icdCode: String,
        conditionName: { type: String, required: true },
        type: { type: String, enum: ['PRIMARY', 'SECONDARY'], default: 'PRIMARY' },
        notes: String,
      },
    ],
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        durationDays: { type: Number, required: true },
        instructions: String,
        isDispensed: { type: Boolean, default: false },
      },
    ],
    diagnostics: [
      {
        testName: { type: String, required: true },
        category: { type: String, default: 'LAB' },
        status: { type: String, enum: ['ORDERED', 'COLLECTED', 'PROCESSED', 'COMPLETED'], default: 'ORDERED' },
        reportUrl: String,
      },
    ],
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'IN_PROGRESS' },
  },
  { timestamps: true }
);

export const Encounter = mongoose.model<IEncounter>('Encounter', EncounterSchema);
