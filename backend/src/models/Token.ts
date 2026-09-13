import mongoose, { Schema, Document } from 'mongoose';

export type TokenStatus =
  | 'WAITING'
  | 'CALLED'
  | 'IN_PROGRESS'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'NO_SHOW'
  | 'CANCELLED';

export interface IToken extends Document {
  tokenId?: string;
  patientId: any;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'M' | 'F' | 'Other';
  patientPhone?: string;
  facilityId?: string;
  facilityName?: string;
  departmentId?: string;
  departmentName?: string;
  hospitalId?: any;
  doctorId?: any;
  doctorName?: string;
  roomNumber?: string;
  counter?: string;
  appointmentId?: any;
  tokenNumber: string;
  queueDate?: string;
  status: TokenStatus;
  priority?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  positionInQueue?: number;
  estimatedWaitMinutes?: number;
  issuedAt?: Date;
  calledAt?: string | Date;
  completedAt?: string | Date;
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    tokenId: { type: String, index: true, sparse: true },
    patientId: { type: Schema.Types.Mixed, required: true, index: true },
    patientName: { type: String, default: 'Rameshwar Sharma' },
    patientAge: { type: Number, default: 48 },
    patientGender: { type: String, enum: ['M', 'F', 'Other'], default: 'M' },
    patientPhone: { type: String, default: '9876543210' },
    facilityId: { type: String, default: 'fac_civil_01', index: true },
    facilityName: { type: String, default: 'Gandhinagar Civil Hospital' },
    departmentId: { type: String, default: 'dep_med', index: true },
    departmentName: { type: String, default: 'General Medicine OPD' },
    hospitalId: { type: Schema.Types.Mixed },
    doctorId: { type: Schema.Types.Mixed },
    doctorName: { type: String, default: 'Dr. Arvind Patel' },
    roomNumber: { type: String, default: 'Room 4' },
    counter: { type: String, default: 'Counter 1' },
    appointmentId: { type: Schema.Types.Mixed },
    tokenNumber: { type: String, required: true, index: true },
    queueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'IN_PROGRESS', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'NO_SHOW', 'CANCELLED'],
      default: 'WAITING',
      index: true,
    },
    priority: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
    positionInQueue: { type: Number, default: 1 },
    estimatedWaitMinutes: { type: Number, default: 15 },
    issuedAt: { type: Date, default: Date.now },
    calledAt: { type: Schema.Types.Mixed },
    completedAt: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.tokenId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Token = mongoose.model<IToken>('Token', TokenSchema);
