import mongoose, { Schema, Document } from 'mongoose';

export type BedType = 'GENERAL' | 'ICU' | 'ISOLATION' | 'MATERNITY' | 'EMERGENCY';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface IBed extends Document {
  hospitalId: mongoose.Types.ObjectId;
  bedNumber: string;
  wardName: string;
  type: BedType;
  status: BedStatus;
  patientId?: mongoose.Types.ObjectId;
  lastUpdated: Date;
}

const BedSchema = new Schema<IBed>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    bedNumber: { type: String, required: true },
    wardName: { type: String, required: true },
    type: { type: String, enum: ['GENERAL', 'ICU', 'ISOLATION', 'MATERNITY', 'EMERGENCY'], default: 'GENERAL' },
    status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'], default: 'AVAILABLE', index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Bed = mongoose.model<IBed>('Bed', BedSchema);
