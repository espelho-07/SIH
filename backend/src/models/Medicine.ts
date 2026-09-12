import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  medicineId?: string;
  facilityId?: string;
  name: string;
  medicineName?: string;
  genericName: string;
  category: string;
  batchNumber?: string;
  availableQuantity?: number;
  minimumStockThreshold?: number;
  unit: string;
  expiryDate?: string;
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'EXPIRING_SOON' | 'OUT_OF_STOCK' | 'QUARANTINED';
  quarantineReason?: string;
  description?: string;
  lastUpdated?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    medicineId: { type: String, index: true, sparse: true },
    facilityId: { type: String, default: 'fac_civil_01', index: true },
    name: { type: String, required: true, index: true },
    medicineName: { type: String },
    genericName: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    batchNumber: { type: String, default: 'BATCH-2026' },
    availableQuantity: { type: Number, default: 100 },
    minimumStockThreshold: { type: Number, default: 20 },
    unit: { type: String, default: 'Tablets' },
    expiryDate: { type: String, default: '2026-12-31' },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'EXPIRING_SOON', 'OUT_OF_STOCK', 'QUARANTINED'],
      default: 'IN_STOCK',
    },
    quarantineReason: { type: String },
    description: { type: String },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.medicineId || (ret._id ? ret._id.toString() : ret.id);
        ret.medicineName = ret.medicineName || ret.name;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Medicine = mongoose.model<IMedicine>('Medicine', MedicineSchema);
