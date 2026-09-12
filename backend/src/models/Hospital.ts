import mongoose, { Schema, Document } from 'mongoose';

export type HospitalType =
  | 'PHC'
  | 'CHC'
  | 'DISTRICT_HOSPITAL'
  | 'GOVERNMENT_HOSPITAL'
  | 'SUB_CENTER'
  | 'OTHER';

export interface IHospital extends Document {
  name: string;
  type: HospitalType;
  address: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  email?: string;
  openingTime: string;
  closingTime: string;
  emergencyAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'SUB_CENTER', 'OTHER'],
      required: true,
    },
    address: { type: String, required: true },
    district: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    phone: { type: String, required: true },
    email: { type: String },
    openingTime: { type: String, default: '08:00 AM' },
    closingTime: { type: String, default: '08:00 PM' },
    emergencyAvailable: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// 2dsphere index for PostGIS-style geospatial queries in MongoDB
HospitalSchema.index({ location: '2dsphere' });

export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema);
