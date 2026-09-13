import mongoose, { Schema, Document } from 'mongoose';

export type MedicineAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK' | 'UNKNOWN';

export interface IHospitalMedicine extends Document {
  hospitalId: mongoose.Types.ObjectId;
  medicineId: mongoose.Types.ObjectId;
  quantity: number;
  availabilityStatus: MedicineAvailabilityStatus;
  lastUpdated: Date;
}

const HospitalMedicineSchema = new Schema<IHospitalMedicine>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    quantity: { type: Number, default: 0 },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK', 'UNKNOWN'],
      default: 'AVAILABLE',
      index: true,
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HospitalMedicineSchema.index({ hospitalId: 1, medicineId: 1 }, { unique: true });

export const HospitalMedicine = mongoose.model<IHospitalMedicine>(
  'HospitalMedicine',
  HospitalMedicineSchema
);
