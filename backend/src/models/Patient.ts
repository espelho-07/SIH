import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  userId?: mongoose.Types.ObjectId;
  abhaId?: string;
  name: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: Date;
  age?: number;
  bloodGroup?: string;
  address: {
    street?: string;
    village?: string;
    block?: string;
    district: string;
    state: string;
    pincode: string;
  };
  assignedAshaId?: mongoose.Types.ObjectId;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  isHighRisk: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    abhaId: { type: String, index: true, sparse: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    dob: { type: Date },
    age: { type: Number },
    bloodGroup: { type: String },
    address: {
      street: { type: String },
      village: { type: String },
      block: { type: String },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    assignedAshaId: { type: Schema.Types.ObjectId, ref: 'User' },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    isHighRisk: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
