import mongoose from 'mongoose';
import { Token, IToken, TokenStatus } from '../../models/Token';
import { BadRequestError } from '../../utils/errors';
import { TokenQuery } from './token.schema';

export class TokenRepository {
  async generateNextToken(data: {
    patientId: string;
    hospitalId: string;
    doctorId: string;
    appointmentId?: string;
    queueDate: string;
  }): Promise<any> {
    const { patientId, hospitalId, doctorId, appointmentId, queueDate } = data;

    // Retry loop to handle concurrent race conditions safely
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const lastToken = await Token.findOne({
          hospitalId,
          doctorId,
          queueDate,
        })
          .sort({ tokenNumber: -1 })
          .select('tokenNumber')
          .lean();

        const nextNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

        const token = await Token.create({
          patientId,
          hospitalId,
          doctorId,
          appointmentId: appointmentId || undefined,
          tokenNumber: String(nextNumber),
          queueDate,
          status: 'WAITING',
          issuedAt: new Date(),
        });

        return this.findTokenById((token as any)._id.toString());
      } catch (error: any) {
        if (error.code === 11000 && attempts < maxAttempts) {
          // Retry on concurrent token number collision
          continue;
        }
        if (error.code === 11000) {
          throw new BadRequestError('High queue volume. Please try requesting a token again.', 'TOKEN_CONCURRENCY_RETRY');
        }
        throw error;
      }
    }
  }

  async findActivePatientTokenForDoctor(patientId: string, doctorId: string, queueDate: string) {
    return Token.findOne({
      patientId,
      doctorId,
      queueDate,
      status: { $in: ['WAITING', 'CALLED', 'IN_PROGRESS'] },
    }).lean();
  }

  async findPatientTokens(patientId: string, query: TokenQuery) {
    const filter: any = { patientId };
    if (query.status) filter.status = query.status;
    if (query.date) filter.queueDate = query.date;

    if (query.upcoming) {
      const todayStr = new Date().toISOString().split('T')[0];
      filter.queueDate = { $gte: todayStr };
    }

    const tokens: any[] = await Token.find(filter)
      .populate('hospitalId', 'name type address district phone emergencyAvailable')
      .populate('doctorId', 'name specialization qualification phone consultationStart consultationEnd')
      .sort({ queueDate: -1, tokenNumber: 1 })
      .lean();

    return tokens.map((t) => this.formatTokenOutput(t));
  }

  async findTokenById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const t: any = await Token.findById(id)
      .populate('patientId', 'name email phone')
      .populate('hospitalId', 'name type address district phone emergencyAvailable')
      .populate('doctorId', 'name specialization qualification phone consultationStart consultationEnd')
      .populate('appointmentId')
      .lean();

    if (!t) return null;
    return this.formatTokenOutput(t);
  }

  async getDoctorQueueStats(hospitalId: string, doctorId: string, queueDate: string) {
    const tokens: any[] = await Token.find({
      hospitalId,
      doctorId,
      queueDate,
    })
      .sort({ tokenNumber: 1 })
      .lean();

    const activeToken = tokens.find((t) => t.status === 'IN_PROGRESS') ||
      tokens.find((t) => t.status === 'CALLED') ||
      tokens.find((t) => t.status === 'WAITING');

    const currentTokenNumber = activeToken ? activeToken.tokenNumber : (tokens.length > 0 ? tokens[tokens.length - 1].tokenNumber : 0);
    const currentStatus = activeToken ? activeToken.status : (tokens.length > 0 ? 'COMPLETED' : 'NO_QUEUE');
    const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;

    return {
      hospitalId,
      doctorId,
      queueDate,
      currentToken: currentTokenNumber,
      currentStatus,
      waitingPatientsCount: waitingCount,
      totalTokensIssued: tokens.length,
      tokens: tokens.map((t) => ({
        id: t._id.toString(),
        tokenNumber: t.tokenNumber,
        status: t.status,
        patientId: t.patientId.toString(),
        issuedAt: t.issuedAt,
        calledAt: t.calledAt,
      })),
    };
  }

  async updateTokenStatus(id: string, status: TokenStatus) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const updateData: any = { status };
    if (status === 'CALLED') updateData.calledAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const updated: any = await Token.findByIdAndUpdate(id, updateData, { returnDocument: 'after' })
      .populate('patientId', 'name email')
      .populate('hospitalId', 'name type district')
      .populate('doctorId', 'name specialization')
      .lean();

    if (!updated) return null;
    return this.formatTokenOutput(updated);
  }

  async getNextWaitingToken(hospitalId: string, doctorId: string, queueDate: string) {
    const nextToken = await Token.findOne({
      hospitalId,
      doctorId,
      queueDate,
      status: 'WAITING',
    })
      .sort({ tokenNumber: 1 })
      .lean();

    if (!nextToken) return null;
    return this.updateTokenStatus(nextToken._id.toString(), 'CALLED');
  }

  private formatTokenOutput(t: any) {
    return {
      id: t._id.toString(),
      patientId: t.patientId?._id?.toString() || t.patientId?.toString() || t.patientId,
      patient: t.patientId && typeof t.patientId === 'object' ? t.patientId : null,
      hospitalId: t.hospitalId?._id?.toString() || t.hospitalId?.toString() || t.hospitalId,
      hospital: t.hospitalId && typeof t.hospitalId === 'object' ? t.hospitalId : null,
      doctorId: t.doctorId?._id?.toString() || t.doctorId?.toString() || t.doctorId,
      doctor: t.doctorId && typeof t.doctorId === 'object' ? t.doctorId : null,
      appointmentId: t.appointmentId?._id?.toString() || t.appointmentId?.toString() || t.appointmentId || null,
      tokenNumber: t.tokenNumber,
      queueDate: t.queueDate,
      status: t.status,
      issuedAt: t.issuedAt,
      calledAt: t.calledAt,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }
}
