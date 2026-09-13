import mongoose, { Schema, Document } from 'mongoose';

export type AmbulanceType = 'BLS' | 'ALS' | 'PATIENT_TRANSPORT';
export type AmbulanceStatus = 'AVAILABLE' | 'ON_DISPATCH' | 'MAINTENANCE' | 'OFF_DUTY';

export interface IAmbulance extends Document {
  vehicleNumber: string;
  type: AmbulanceType;
  hospitalId?: mongoose.Types.ObjectId;
  driverName: string;
  driverPhone: string;
  status: AmbulanceStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAmbulanceRequest extends Document {
  patientId?: mongoose.Types.ObjectId;
  requesterName: string;
  requesterPhone: string;
  pickupAddress: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL';
  assignedAmbulanceId?: mongoose.Types.ObjectId;
  destinationHospitalId?: mongoose.Types.ObjectId;
  status: 'REQUESTED' | 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'COMPLETED' | 'CANCELLED';
  requestedAt: Date;
  completedAt?: Date;
}

const AmbulanceSchema = new Schema<IAmbulance>(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['BLS', 'ALS', 'PATIENT_TRANSPORT'], default: 'BLS' },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'ON_DISPATCH', 'MAINTENANCE', 'OFF_DUTY'], default: 'AVAILABLE' },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const AmbulanceRequestSchema = new Schema<IAmbulanceRequest>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    requesterName: { type: String, required: true },
    requesterPhone: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    pickupLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    urgency: { type: String, enum: ['ROUTINE', 'URGENT', 'CRITICAL'], default: 'URGENT' },
    assignedAmbulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance' },
    destinationHospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    status: {
      type: String,
      enum: ['REQUESTED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

export const Ambulance = mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);
export const AmbulanceRequest = mongoose.model<IAmbulanceRequest>('AmbulanceRequest', AmbulanceRequestSchema);
