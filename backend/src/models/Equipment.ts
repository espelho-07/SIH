import mongoose, { Schema, Document } from 'mongoose';

export type EquipmentStatus = 'OPERATIONAL' | 'DOWN_FOR_MAINTENANCE' | 'UNAVAILABLE';

export interface IEquipment extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  category: string; // e.g. Ultrasound, X-Ray, ECG, Biochemistry Analyzer
  modelNumber?: string;
  status: EquipmentStatus;
  lastVerifiedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    modelNumber: String,
    status: {
      type: String,
      enum: ['OPERATIONAL', 'DOWN_FOR_MAINTENANCE', 'UNAVAILABLE'],
      default: 'OPERATIONAL',
      index: true,
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

export const Equipment = mongoose.model<IEquipment>('Equipment', EquipmentSchema);
