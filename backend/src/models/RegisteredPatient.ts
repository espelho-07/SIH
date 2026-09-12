import mongoose, { Schema, Document } from 'mongoose';

export interface IRegisteredPatient extends Document {
  uhid: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  address: string;
  district: string;
  abhaId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  category: 'GENERAL' | 'SENIOR' | 'PREGNANT' | 'CHILD' | 'EMERGENCY';
  registeredByFacility: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegisteredPatientSchema = new Schema<IRegisteredPatient>(
  {
    uhid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['M', 'F', 'Other'], required: true },
    phone: { type: String, required: true, index: true },
    address: { type: String, default: 'Gandhinagar' },
    district: { type: String, default: 'Gandhinagar' },
    abhaId: { type: String, index: true, sparse: true },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    category: {
      type: String,
      enum: ['GENERAL', 'SENIOR', 'PREGNANT', 'CHILD', 'EMERGENCY'],
      default: 'GENERAL',
    },
    registeredByFacility: { type: String, default: 'fac_civil_01' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.uhid;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const RegisteredPatient = mongoose.model<IRegisteredPatient>(
  'RegisteredPatient',
  RegisteredPatientSchema
);
