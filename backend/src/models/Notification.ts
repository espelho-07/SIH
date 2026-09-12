import mongoose, { Schema, Document } from 'mongoose';

export type NotificationChannel = 'IN_APP' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'], default: 'MEDIUM' },
    channels: [{ type: String, enum: ['IN_APP', 'SMS', 'WHATSAPP', 'PUSH'], default: 'IN_APP' }],
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
