import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
  dispensedStatus: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED';
  dispensedQuantity?: number;
  totalQuantity: number;
}

export interface IPrescription extends Document {
  prescriptionId: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  issuedAt: string;
  diagnosisSummary: string;
  items: IPrescriptionItem[];
  status: 'PENDING' | 'PARTIALLY_DISPENSED' | 'DISPENSED';
  pharmacyNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: { type: String, required: true, unique: true, index: true },
    encounterId: { type: String, default: 'enc_01' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: 'usr_doc_01' },
    doctorName: { type: String, default: 'Dr. Arvind Patel' },
    facilityId: { type: String, default: 'fac_civil_01' },
    facilityName: { type: String, default: 'Gandhinagar Civil Hospital' },
    issuedAt: { type: String, default: () => new Date().toISOString() },
    diagnosisSummary: { type: String, default: 'Clinical consultation' },
    items: [
      {
        id: { type: String, default: () => `item_${Date.now()}` },
        medicineName: { type: String, required: true },
        genericName: { type: String },
        dosage: { type: String, default: '1 tab' },
        frequency: { type: String, default: '1-0-1' },
        duration: { type: String, default: '5 days' },
        route: { type: String, default: 'Oral' },
        instructions: { type: String },
        dispensedStatus: {
          type: String,
          enum: ['PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED'],
          default: 'PENDING',
        },
        dispensedQuantity: { type: Number, default: 0 },
        totalQuantity: { type: Number, default: 10 },
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED'],
      default: 'PENDING',
    },
    pharmacyNotes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.prescriptionId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Prescription = mongoose.model<IPrescription>(
  'Prescription',
  PrescriptionSchema
);
