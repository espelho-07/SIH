import { Token } from '../../models/Token';
import { Doctor } from '../../models/Doctor';
import { broadcastTokenCalled, broadcastQueueUpdated } from '../../socket/socket.server';
import mongoose from 'mongoose';

export class QueueService {
  async getQueues(query: any) {
    const filter: any = {};
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.doctorId) filter.doctorId = query.doctorId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctors = await Doctor.find(query.doctorId ? { _id: query.doctorId } : {}).limit(10);
    const queues = [];
    for (const doc of doctors) {
      const waitingCount = await Token.countDocuments({
        $or: [{ doctorId: doc._id }, { doctorId: doc._id.toString() }],
        status: 'WAITING',
      });
      const currentToken = await Token.findOne({
        $or: [{ doctorId: doc._id }, { doctorId: doc._id.toString() }],
        status: 'CALLED',
      }).sort({ updatedAt: -1 });

      queues.push({
        queueId: `q_${doc._id}`,
        doctorId: doc._id,
        doctorName: doc.name,
        specialization: doc.specialization,
        status: 'OPEN',
        waitingCount,
        currentlyServingToken: currentToken ? currentToken.tokenNumber : null,
      });
    }
    return queues;
  }

  async getQueueById(id: string) {
    return this.getLiveQueue(id);
  }

  async getLiveQueue(facilityId: string, departmentId?: string) {
    const cleanId = facilityId.replace('q_', '');
    const filter: any = {
      $or: [
        { facilityId: cleanId },
        { hospitalId: cleanId },
        { doctorId: cleanId },
      ],
    };

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const tokens = await Token.find(filter).sort({ positionInQueue: 1, createdAt: 1 });

    const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
    const calledToken = tokens.find((t) => t.status === 'CALLED' || t.status === 'IN_CONSULTATION') ||
      tokens.find((t) => t.status === 'COMPLETED');

    const sampleToken = tokens[0];

    const liveState = {
      facilityId: cleanId,
      departmentId: departmentId || sampleToken?.departmentId || 'dep_med',
      departmentName: sampleToken?.departmentName || 'General Medicine OPD',
      currentTokenNumber: calledToken ? calledToken.tokenNumber : (tokens.length > 0 ? tokens[0].tokenNumber : 'A-035'),
      callingRoom: calledToken?.roomNumber ? `${calledToken.roomNumber} (${calledToken.doctorName || 'Dr. Arvind Patel'})` : 'Room 4 (Dr. Arvind Patel)',
      totalWaiting: waitingTokens.length,
      averageConsultTimeMinutes: 8,
      tokens: tokens.map((t) => (t.toJSON ? t.toJSON() : t)),
      updatedAt: new Date().toISOString(),
    };

    return liveState;
  }

  async getPosition(queueId: string, tokenId: string) {
    const token = await Token.findOne({
      $or: [
        { tokenId },
        mongoose.isValidObjectId(tokenId) ? { _id: tokenId } : { tokenId },
      ],
    });

    if (!token) return { position: -1, estimatedWaitMinutes: 0 };

    const aheadCount = await Token.countDocuments({
      facilityId: token.facilityId,
      status: 'WAITING',
      positionInQueue: { $lt: token.positionInQueue || 1 },
    });

    return {
      tokenId: token.tokenId || token._id,
      tokenNumber: token.tokenNumber,
      status: token.status,
      positionAhead: aheadCount,
      estimatedWaitMinutes: aheadCount * 8,
    };
  }

  async callNext(facilityId: string, departmentId?: string) {
    const cleanId = facilityId.replace('q_', '');
    const filter: any = {
      $or: [
        { facilityId: cleanId },
        { hospitalId: cleanId },
        { doctorId: cleanId },
      ],
      status: 'WAITING',
    };

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const nextToken = await Token.findOne(filter).sort({ positionInQueue: 1, createdAt: 1 });

    if (nextToken) {
      nextToken.status = 'CALLED';
      nextToken.calledAt = new Date().toISOString();
      nextToken.positionInQueue = 0;
      nextToken.estimatedWaitMinutes = 0;
      await nextToken.save();

      // Recalculate positions for other waiting tokens
      const otherWaiting = await Token.find({
        facilityId: nextToken.facilityId,
        departmentId: nextToken.departmentId,
        status: 'WAITING',
      }).sort({ createdAt: 1 });

      for (let i = 0; i < otherWaiting.length; i++) {
        otherWaiting[i].positionInQueue = i + 1;
        otherWaiting[i].estimatedWaitMinutes = (i + 1) * 6;
        await otherWaiting[i].save();
      }

      const tokenJson = nextToken.toJSON ? nextToken.toJSON() : nextToken;
      broadcastTokenCalled(tokenJson);
    }

    const queueState = await this.getLiveQueue(cleanId, departmentId);
    broadcastQueueUpdated(queueState);

    return {
      calledToken: nextToken ? (nextToken.toJSON ? nextToken.toJSON() : nextToken) : null,
      queue: queueState,
    };
  }

  async updateTokenAction(tokenOrQueueId: string, action: 'call' | 'skip' | 'no-show' | 'recall') {
    const statusMap: Record<string, any> = {
      call: 'CALLED',
      skip: 'SKIPPED',
      'no-show': 'NO_SHOW',
      recall: 'WAITING',
    };
    const status = statusMap[action] || 'WAITING';

    const token = await Token.findOneAndUpdate(
      {
        $or: [
          { tokenId: tokenOrQueueId },
          mongoose.isValidObjectId(tokenOrQueueId) ? { _id: tokenOrQueueId } : { tokenId: tokenOrQueueId },
        ],
      },
      { status },
      { new: true }
    );

    if (token) {
      const queueState = await this.getLiveQueue(token.facilityId || 'fac_civil_01', token.departmentId);
      broadcastQueueUpdated(queueState);
    }

    return token ? (token.toJSON ? token.toJSON() : token) : null;
  }
}
