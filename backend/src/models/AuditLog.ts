import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  actorId?: mongoose.Types.ObjectId;
  actorRole?: string;
  targetPatientId?: mongoose.Types.ObjectId;
  facilityId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String },
    targetPatientId: { type: Schema.Types.ObjectId, ref: 'Patient', index: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    ipAddress: String,
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
