import mongoose, { Schema, Document } from 'mongoose';

export type ReferralStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'MORE_INFO_REQUESTED'
  | 'REROUTED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CLOSED';

export type ReferralUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export interface IReferral extends Document {
  patientId: mongoose.Types.ObjectId;
  referringDoctorId: mongoose.Types.ObjectId;
  referringFacilityId: mongoose.Types.ObjectId;
  receivingFacilityId: mongoose.Types.ObjectId;
  targetSpecialty: string;
  requiredEquipment?: string[];
  reason: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  rejectionReason?: string;
  additionalInfoRequest?: string;
  rerouteHistory?: Array<{
    previousFacilityId: mongoose.Types.ObjectId;
    reroutedAt: Date;
    reason?: string;
  }>;
  arrivedAt?: Date;
  outcomeNotes?: string;
  timeline: Array<{
    status: ReferralStatus;
    updatedBy: mongoose.Types.ObjectId;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    referringDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    referringFacilityId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    receivingFacilityId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    targetSpecialty: { type: String, required: true },
    requiredEquipment: [{ type: String }],
    reason: { type: String, required: true },
    urgency: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'MORE_INFO_REQUESTED', 'REROUTED', 'ARRIVED', 'COMPLETED', 'CLOSED'],
      default: 'PENDING',
      index: true,
    },
    rejectionReason: String,
    additionalInfoRequest: String,
    rerouteHistory: [
      {
        previousFacilityId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
        reroutedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    arrivedAt: Date,
    outcomeNotes: String,
    timeline: [
      {
        status: { type: String, required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
