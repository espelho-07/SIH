import mongoose, { Schema, Document } from 'mongoose';

export interface IConsent extends Document {
  patientId: mongoose.Types.ObjectId;
  grantedToFacilityId?: mongoose.Types.ObjectId;
  grantedToDoctorId?: mongoose.Types.ObjectId;
  purpose: string;
  isGranted: boolean;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBreakGlassLog extends Document {
  patientId: mongoose.Types.ObjectId;
  accessedByUserId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  reason: string;
  accessedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    grantedToFacilityId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    grantedToDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    purpose: { type: String, required: true },
    isGranted: { type: Boolean, default: true },
    validUntil: Date,
  },
  { timestamps: true }
);

const BreakGlassLogSchema = new Schema<IBreakGlassLog>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    accessedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    reason: { type: String, required: true },
    accessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);
export const BreakGlassLog = mongoose.model<IBreakGlassLog>('BreakGlassLog', BreakGlassLogSchema);
