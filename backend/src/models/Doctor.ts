import mongoose, { Schema, Document } from 'mongoose';

export type DoctorAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_LEAVE' | 'UNKNOWN';

export interface IDoctor extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  specialization: string;
  qualification: string;
  phone: string;
  consultationStart: string;
  consultationEnd: string;
  availabilityStatus: DoctorAvailabilityStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true, index: true },
    qualification: { type: String, required: true },
    phone: { type: String, required: true },
    consultationStart: { type: String, default: '09:00 AM' },
    consultationEnd: { type: String, default: '05:00 PM' },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'UNKNOWN'],
      default: 'AVAILABLE',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
