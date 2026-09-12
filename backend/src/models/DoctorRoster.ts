import mongoose, { Schema, Document } from 'mongoose';

export type RosterStatus = 'ON_DUTY' | 'ON_CALL' | 'ABSENT';

export interface IDoctorRoster extends Document {
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  status: RosterStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorRosterSchema = new Schema<IDoctorRoster>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    shiftDate: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['ON_DUTY', 'ON_CALL', 'ABSENT'], default: 'ON_DUTY' },
  },
  { timestamps: true }
);

export const DoctorRoster = mongoose.model<IDoctorRoster>('DoctorRoster', DoctorRosterSchema);
