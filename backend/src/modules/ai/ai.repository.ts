import { SymptomAnalysis, ISymptomAnalysis } from '../../models/SymptomAnalysis';
import mongoose from 'mongoose';

export class AIRepository {
  async saveAnalysis(data: Partial<ISymptomAnalysis>): Promise<ISymptomAnalysis> {
    const analysis = new SymptomAnalysis(data);
    return await analysis.save();
  }

  async getPatientHistory(patientId: string, limit: number = 10): Promise<ISymptomAnalysis[]> {
    return await SymptomAnalysis.find({ patientId: new mongoose.Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
