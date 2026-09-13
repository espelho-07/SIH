import mongoose, { Schema, Document } from 'mongoose';

export type AISeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';

export interface IPossibleCondition {
  name: string;
  confidence: number;
}

export interface ISymptomAnalysis extends Document {
  patientId: mongoose.Types.ObjectId;
  symptomsText: string;
  duration?: string;
  extractedSymptoms: string[];
  possibleConditions: IPossibleCondition[];
  severity: AISeverityLevel;
  redFlags: string[];
  recommendedSpecialization: string;
  recommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomAnalysisSchema = new Schema<ISymptomAnalysis>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symptomsText: { type: String, required: true },
    duration: { type: String },
    extractedSymptoms: [{ type: String }],
    possibleConditions: [
      {
        name: { type: String, required: true },
        confidence: { type: Number, required: true },
      },
    ],
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'EMERGENCY'],
      default: 'LOW',
      index: true,
    },
    redFlags: [{ type: String }],
    recommendedSpecialization: { type: String, default: 'General Physician' },
    recommendation: { type: String, required: true },
  },
  { timestamps: true }
);

SymptomAnalysisSchema.index({ patientId: 1, createdAt: -1 });

export const SymptomAnalysis = mongoose.model<ISymptomAnalysis>(
  'SymptomAnalysis',
  SymptomAnalysisSchema
);
