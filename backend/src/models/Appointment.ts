import mongoose, { Schema, Document } from 'mongoose';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface IAppointment extends Document {
  appointmentId?: string;
  patientId: any;
  patientName?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'Other';
  facilityId?: string;
  facilityName?: string;
  doctorId: any;
  doctorName?: string;
  specialty?: string;
  hospitalId?: any;
  appointmentDate: string; // YYYY-MM-DD
  date?: string;
  timeSlot: string;
  reason?: string;
  status: AppointmentStatus;
  type?: 'IN_PERSON' | 'TELECONSULTATION';
  queueTokenId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: { type: String, index: true, sparse: true },
    patientId: { type: Schema.Types.Mixed, required: true, index: true },
    patientName: { type: String, default: 'Rameshwar Sharma' },
    patientPhone: { type: String, default: '9876543210' },
    patientAge: { type: Number, default: 48 },
    patientGender: { type: String, enum: ['M', 'F', 'Other'], default: 'M' },
    facilityId: { type: String, default: 'fac_civil_01', index: true },
    facilityName: { type: String, default: 'Gandhinagar Civil Hospital' },
    doctorId: { type: Schema.Types.Mixed, required: true, index: true },
    doctorName: { type: String, default: 'Dr. Arvind Patel' },
    specialty: { type: String, default: 'General Medicine' },
    hospitalId: { type: Schema.Types.Mixed },
    appointmentDate: { type: String, required: true, index: true },
    date: { type: String },
    timeSlot: { type: String, required: true },
    reason: { type: String, default: 'Consultation' },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CHECKED_IN', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'SCHEDULED',
      index: true,
    },
    type: { type: String, enum: ['IN_PERSON', 'TELECONSULTATION'], default: 'IN_PERSON' },
    queueTokenId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.appointmentId || (ret._id ? ret._id.toString() : ret.id);
        ret.date = ret.date || ret.appointmentDate;
        ret.facilityId = ret.facilityId || (ret.hospitalId ? ret.hospitalId.toString() : 'fac_civil_01');
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
