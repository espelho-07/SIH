import mongoose, { Schema, Document } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK';

export interface IBloodInventory extends Document {
  hospitalId: mongoose.Types.ObjectId;
  bloodGroup: BloodGroup;
  availableUnits: number;
  status: BloodAvailabilityStatus;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BloodInventorySchema = new Schema<IBloodInventory>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      index: true,
    },
    availableUnits: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK'],
      default: 'AVAILABLE',
      index: true,
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });
BloodInventorySchema.index({ bloodGroup: 1, status: 1, availableUnits: 1 });

export const BloodInventory = mongoose.model<IBloodInventory>(
  'BloodInventory',
  BloodInventorySchema
);
