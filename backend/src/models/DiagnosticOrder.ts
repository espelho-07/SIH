import mongoose, { Schema, Document } from 'mongoose';

export interface ILabResultParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
}

export interface IDiagnosticOrder extends Document {
  orderId: string;
  encounterId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone?: string;
  patientAbha?: string;
  testName: string;
  testCategory: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'RADIOLOGY' | 'MICROBIOLOGY' | 'PATHOLOGY';
  priority: 'ROUTINE' | 'URGENT' | 'STAT';
  orderedBy: string;
  orderedAt: string;
  status:
    | 'ORDERED'
    | 'AWAITING_SAMPLE'
    | 'SAMPLE_COLLECTED'
    | 'SAMPLE_RECEIVED'
    | 'PROCESSING'
    | 'RESULT_SUBMITTED'
    | 'REPORT_READY'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED';
  clinicalNotes?: string;
  sampleType?: string;
  sampleCollectedAt?: string;
  collectedBy?: string;
  sampleBarcode?: string;
  sampleReceivedAt?: string;
  receivedBy?: string;
  sampleRejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  processingStartedAt?: string;
  processedBy?: string;
  resultSubmittedAt?: string;
  technicianName?: string;
  resultSummary?: string;
  parameters?: ILabResultParameter[];
  reportPdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticOrderSchema = new Schema<IDiagnosticOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    encounterId: { type: String, default: 'enc_01' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, default: 35 },
    patientGender: { type: String, default: 'M' },
    patientPhone: { type: String },
    patientAbha: { type: String },
    testName: { type: String, required: true },
    testCategory: {
      type: String,
      enum: ['HEMATOLOGY', 'BIOCHEMISTRY', 'RADIOLOGY', 'MICROBIOLOGY', 'PATHOLOGY'],
      default: 'HEMATOLOGY',
    },
    priority: { type: String, enum: ['ROUTINE', 'URGENT', 'STAT'], default: 'ROUTINE' },
    orderedBy: { type: String, default: 'Dr. Arvind Patel' },
    orderedAt: { type: String, default: () => new Date().toISOString() },
    status: {
      type: String,
      enum: [
        'ORDERED',
        'AWAITING_SAMPLE',
        'SAMPLE_COLLECTED',
        'SAMPLE_RECEIVED',
        'PROCESSING',
        'RESULT_SUBMITTED',
        'REPORT_READY',
        'COMPLETED',
        'CANCELLED',
        'REJECTED',
      ],
      default: 'AWAITING_SAMPLE',
    },
    clinicalNotes: { type: String },
    sampleType: { type: String, default: 'Venous Blood' },
    sampleCollectedAt: { type: String },
    collectedBy: { type: String },
    sampleBarcode: { type: String },
    sampleReceivedAt: { type: String },
    receivedBy: { type: String },
    sampleRejectedAt: { type: String },
    rejectedBy: { type: String },
    rejectionReason: { type: String },
    processingStartedAt: { type: String },
    processedBy: { type: String },
    resultSubmittedAt: { type: String },
    technicianName: { type: String },
    resultSummary: { type: String },
    parameters: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String, default: '' },
        referenceRange: { type: String, default: '' },
        status: { type: String, enum: ['NORMAL', 'ABNORMAL', 'CRITICAL'], default: 'NORMAL' },
      },
    ],
    reportPdfUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.orderId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DiagnosticOrder = mongoose.model<IDiagnosticOrder>(
  'DiagnosticOrder',
  DiagnosticOrderSchema
);
