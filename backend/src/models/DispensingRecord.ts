import mongoose, { Schema, Document } from 'mongoose';

export interface IDispensingRecordItem {
  medicineName: string;
  genericName?: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  dosageInstructions: string;
}

export interface IDispensingRecord extends Document {
  recordId: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  dispensedBy: string;
  dispensedAt: string;
  items: IDispensingRecordItem[];
  notes?: string;
}

const DispensingRecordSchema = new Schema<IDispensingRecord>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    prescriptionId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, default: 35 },
    patientGender: { type: String, default: 'M' },
    patientPhone: { type: String },
    doctorId: { type: String, default: 'usr_doc_01' },
    doctorName: { type: String, default: 'Dr. Arvind Patel' },
    facilityId: { type: String, default: 'fac_civil_01' },
    facilityName: { type: String, default: 'Gandhinagar Civil Hospital' },
    dispensedBy: { type: String, default: 'Priya Sharma (Pharmacist)' },
    dispensedAt: { type: String, default: () => new Date().toISOString() },
    items: [
      {
        medicineName: { type: String, required: true },
        genericName: { type: String },
        batchNumber: { type: String, default: 'BATCH-2026' },
        quantity: { type: Number, required: true },
        unit: { type: String, default: 'Tablets' },
        dosageInstructions: { type: String, default: 'As directed' },
      },
    ],
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.recordId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DispensingRecord = mongoose.model<IDispensingRecord>(
  'DispensingRecord',
  DispensingRecordSchema
);
