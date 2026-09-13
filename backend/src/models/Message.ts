import mongoose, { Schema, Document } from 'mongoose';

export type MessageType = 'TEXT';

export interface IMessage extends Document {
  consultationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId?: mongoose.Types.ObjectId;
  message: string;
  messageType: MessageType;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Teleconsultation',
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['TEXT'], default: 'TEXT' },
  },
  { timestamps: true }
);

MessageSchema.index({ consultationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
