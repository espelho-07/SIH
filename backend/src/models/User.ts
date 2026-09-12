import mongoose, { Schema, Document } from 'mongoose';

export type UserRole =
  | 'USER'
  | 'ADMIN'
  | 'HOSPITAL_STAFF'
  | 'PATIENT'
  | 'ASHA'
  | 'DOCTOR'
  | 'FACILITY_STAFF'
  | 'DISTRICT_ADMIN'
  | 'SUPER_ADMIN';

export type StaffSubType =
  | 'REGISTRATION_CLERK'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'FACILITY_OPERATIONS';

export interface IUser extends Document {
  email?: string;
  phone?: string;
  password?: string;
  name: string;
  role: UserRole;
  staffSubType?: StaffSubType;
  facilityId?: string;
  facilityName?: string;
  district?: string;
  avatar?: string;
  abhaId?: string;
  gender?: 'M' | 'F' | 'Other';
  age?: number;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, sparse: true, index: true },
    phone: { type: String, sparse: true, index: true },
    password: { type: String },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'HOSPITAL_STAFF', 'PATIENT', 'ASHA', 'DOCTOR', 'FACILITY_STAFF', 'DISTRICT_ADMIN', 'SUPER_ADMIN'],
      default: 'PATIENT',
    },
    staffSubType: {
      type: String,
      enum: ['REGISTRATION_CLERK', 'PHARMACIST', 'LAB_TECHNICIAN', 'FACILITY_OPERATIONS'],
    },
    facilityId: { type: String },
    facilityName: { type: String },
    district: { type: String },
    avatar: { type: String },
    abhaId: { type: String, sparse: true },
    gender: { type: String, enum: ['M', 'F', 'Other'] },
    age: { type: Number },
    permissions: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
