import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncMutation extends Document {
  ashaId: mongoose.Types.ObjectId;
  clientMutationId: string;
  entityType: 'PATIENT' | 'VISIT' | 'SCREENING' | 'VITAL';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, any>;
  status: 'PENDING' | 'APPLIED' | 'CONFLICT' | 'FAILED';
  appliedAt?: Date;
  conflictDetails?: string;
  createdAt: Date;
}

const SyncMutationSchema = new Schema<ISyncMutation>(
  {
    ashaId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientMutationId: { type: String, required: true, unique: true },
    entityType: { type: String, enum: ['PATIENT', 'VISIT', 'SCREENING', 'VITAL'], required: true },
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['PENDING', 'APPLIED', 'CONFLICT', 'FAILED'], default: 'PENDING', index: true },
    appliedAt: Date,
    conflictDetails: String,
  },
  { timestamps: true }
);

export const SyncMutation = mongoose.model<ISyncMutation>('SyncMutation', SyncMutationSchema);
