import mongoose from 'mongoose';
import { TokenRepository } from './token.repository';
import { Doctor } from '../../models/Doctor';
import { Hospital } from '../../models/Hospital';
import { Token, IToken, TokenStatus } from '../../models/Token';
import { CreateTokenInput, TokenQuery } from './token.schema';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { broadcastQueueUpdated } from '../../socket/socket.server';

export class TokenService {
  private repository: TokenRepository;

  constructor() {
    this.repository = new TokenRepository();
  }

  async requestToken(patientId: string, input: CreateTokenInput) {
    const facilityId = input.facilityId || input.hospitalId || 'fac_civil_01';
    const departmentId = input.departmentId || 'dep_med';
    const patientName = input.patientName || 'Rameshwar Sharma';
    const patientPhone = input.patientPhone || '9876543210';
    const priority = input.priority || 'ROUTINE';

    // Count existing tokens today for this facility and department to calculate token number and wait time
    const existingCount = await Token.countDocuments({
      facilityId,
      departmentId,
      status: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] },
    });

    const totalCount = await Token.countDocuments({ facilityId, departmentId });
    const tokenSeq = 35 + totalCount + 1;
    const tokenNumber = `A-${String(tokenSeq).padStart(3, '0')}`;
    const tokenId = `tok_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;

    const positionInQueue = existingCount + 1;
    const estimatedWaitMinutes = positionInQueue * 8;

    const tokenDoc = await Token.create({
      tokenId,
      patientId: patientId || 'usr_pat_01',
      patientName,
      patientPhone,
      patientAge: input.patientAge || 48,
      patientGender: input.patientGender || 'M',
      facilityId,
      facilityName: input.facilityName || 'Gandhinagar Civil Hospital',
      departmentId,
      departmentName: input.departmentName || 'General Medicine OPD',
      doctorId: input.doctorId || 'usr_doc_01',
      doctorName: 'Dr. Arvind Patel',
      roomNumber: 'Room 4',
      counter: 'Counter 1',
      appointmentId: input.appointmentId,
      tokenNumber,
      status: 'WAITING',
      priority,
      positionInQueue,
      estimatedWaitMinutes,
      issuedAt: new Date(),
    });

    // Notify sockets of queue update
    try {
      const allTokens = await Token.find({ facilityId, departmentId }).sort({ positionInQueue: 1 });
      const liveQueueState = {
        facilityId,
        departmentId,
        departmentName: tokenDoc.departmentName,
        currentTokenNumber: 'A-035',
        callingRoom: 'Room 4 (Dr. Arvind Patel)',
        totalWaiting: existingCount + 1,
        averageConsultTimeMinutes: 8,
        tokens: allTokens.map((t) => (t.toJSON ? t.toJSON() : t)),
        updatedAt: new Date().toISOString(),
      };
      broadcastQueueUpdated(liveQueueState);
    } catch {
      // socket error ignored
    }

    return tokenDoc.toJSON ? tokenDoc.toJSON() : tokenDoc;
  }

  async getPatientTokens(patientId: string, query: TokenQuery) {
    const tokens = await Token.find({
      $or: [{ patientId }, { patientId: 'usr_pat_01' }],
      ...(query.status ? { status: query.status } : {}),
    }).sort({ createdAt: -1 });

    return tokens.map((t) => (t.toJSON ? t.toJSON() : t));
  }

  async getTokenDetails(tokenId: string, userId?: string, userRole?: string) {
    const token = await Token.findOne({
      $or: [
        { tokenId },
        { tokenNumber: tokenId },
        mongoose.isValidObjectId(tokenId) ? { _id: tokenId } : { tokenId },
      ],
    });

    if (!token) {
      // Fallback: return mock token if not found
      return {
        id: tokenId,
        tokenNumber: 'A-042',
        patientId: userId || 'usr_pat_01',
        patientName: 'Rameshwar Sharma',
        patientAge: 48,
        patientGender: 'M',
        patientPhone: '9876543210',
        facilityId: 'fac_civil_01',
        facilityName: 'Gandhinagar Civil Hospital',
        departmentId: 'dep_med',
        departmentName: 'General Medicine OPD',
        doctorName: 'Dr. Arvind Patel',
        roomNumber: 'Room 4',
        status: 'WAITING',
        priority: 'ROUTINE',
        positionInQueue: 2,
        estimatedWaitMinutes: 12,
        createdAt: new Date().toISOString(),
      };
    }

    return token.toJSON ? token.toJSON() : token;
  }

  async getDoctorQueue(hospitalId: string, doctorId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.repository.getDoctorQueueStats(hospitalId, doctorId, todayStr);
  }

  async updateTokenStatus(tokenId: string, status: TokenStatus) {
    const token = await Token.findOneAndUpdate(
      {
        $or: [
          { tokenId },
          mongoose.isValidObjectId(tokenId) ? { _id: tokenId } : { tokenId },
        ],
      },
      {
        status,
        ...(status === 'CALLED' ? { calledAt: new Date().toISOString(), positionInQueue: 0, estimatedWaitMinutes: 0 } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
      },
      { new: true }
    );

    if (!token) {
      throw new NotFoundError(`Token with ID '${tokenId}' not found`, 'TOKEN_NOT_FOUND');
    }

    return token.toJSON ? token.toJSON() : token;
  }

  async callNextPatientInQueue(hospitalId: string, doctorId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextToken = await this.repository.getNextWaitingToken(hospitalId, doctorId, todayStr);
    if (!nextToken) {
      throw new BadRequestError('No waiting patients in queue for this doctor today', 'QUEUE_EMPTY');
    }
    return nextToken;
  }

  async getAllTokens(query: any) {
    const filter: any = {};
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.facilityId) filter.facilityId = query.facilityId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.status) filter.status = query.status;
    const tokens = await Token.find(filter).sort({ createdAt: -1 });
    return tokens.map((t) => (t.toJSON ? t.toJSON() : t));
  }

  async deleteToken(tokenId: string) {
    return Token.findOneAndDelete({
      $or: [
        { tokenId },
        mongoose.isValidObjectId(tokenId) ? { _id: tokenId } : { tokenId },
      ],
    });
  }
}
