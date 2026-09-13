import mongoose, { Schema, Document } from 'mongoose';

export interface IHospitalService extends Document {
  hospitalId: mongoose.Types.ObjectId;
  serviceName: string;
  isAvailable: boolean;
  description?: string;
  estimatedCost?: number;
  minCost?: number;
  maxCost?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalServiceSchema = new Schema<IHospitalService>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    serviceName: { type: String, required: true, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    description: { type: String },
    estimatedCost: { type: Number },
    minCost: { type: Number },
    maxCost: { type: Number },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

HospitalServiceSchema.index({ hospitalId: 1, serviceName: 1 });

export const HospitalService = mongoose.model<IHospitalService>(
  'HospitalService',
  HospitalServiceSchema
);
