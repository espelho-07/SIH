import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowup extends Document {
  patientId: mongoose.Types.ObjectId;
  assignedAshaId?: mongoose.Types.ObjectId;
  assignedDoctorId?: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  encounterId?: mongoose.Types.ObjectId;
  scheduledDate: Date;
  reason: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';
  completionNotes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowupSchema = new Schema<IFollowup>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    assignedAshaId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    scheduledDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'CANCELLED'], default: 'PENDING' },
    completionNotes: String,
    completedAt: Date,
  },
  { timestamps: true }
);

export const Followup = mongoose.model<IFollowup>('Followup', FollowupSchema);
