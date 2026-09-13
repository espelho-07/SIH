import mongoose, { Schema, Document } from 'mongoose';

export interface IAshaVisit extends Document {
  ashaId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  visitDate: Date;
  visitType: 'ROUTINE' | 'SCREENING' | 'FOLLOWUP' | 'HIGH_RISK';
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    bloodGlucose?: number;
    spO2?: number;
    temperature?: number;
    weight?: number;
  };
  screeningResult?: {
    condition: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes?: string;
  };
  followupScheduledDate?: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const AshaVisitSchema = new Schema<IAshaVisit>(
  {
    ashaId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    visitDate: { type: Date, default: Date.now },
    visitType: { type: String, enum: ['ROUTINE', 'SCREENING', 'FOLLOWUP', 'HIGH_RISK'], default: 'ROUTINE' },
    vitals: {
      bpSystolic: Number,
      bpDiastolic: Number,
      heartRate: Number,
      bloodGlucose: Number,
      spO2: Number,
      temperature: Number,
      weight: Number,
    },
    screeningResult: {
      condition: String,
      riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
      notes: String,
    },
    followupScheduledDate: Date,
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
  },
  { timestamps: true }
);

export const AshaVisit = mongoose.model<IAshaVisit>('AshaVisit', AshaVisitSchema);
