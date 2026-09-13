import mongoose, { Schema, Document } from 'mongoose';

export type TeleconsultationStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITeleconsultation extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  reason: string;
  status: TeleconsultationStatus;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeleconsultationSchema = new Schema<ITeleconsultation>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
      index: true,
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export const Teleconsultation = mongoose.model<ITeleconsultation>(
  'Teleconsultation',
  TeleconsultationSchema
);
