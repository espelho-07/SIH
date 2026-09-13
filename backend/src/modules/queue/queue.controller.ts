import { Request, Response } from 'express';
import { QueueService } from './queue.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const queueService = new QueueService();

export class QueueController {
  async getQueues(req: Request, res: Response) {
    try {
      const queues = await queueService.getQueues(req.query);
      return sendSuccess(res, 'Queues retrieved successfully', queues);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getQueueById(req: Request, res: Response) {
    try {
      const queue = await queueService.getQueueById(getParam(req.params.id));
      if (!queue) return sendError(res, 'Queue not found', 404);
      return sendSuccess(res, 'Queue details', queue);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getLiveQueue(req: Request, res: Response) {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const live = await queueService.getLiveQueue(getParam(req.params.id), departmentId);
      return sendSuccess(res, 'Live queue status', live);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPosition(req: Request, res: Response) {
    try {
      const pos = await queueService.getPosition(getParam(req.params.id), getParam(req.params.tokenId));
      return sendSuccess(res, 'Queue position status', pos);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async callNext(req: Request, res: Response) {
    try {
      const departmentId = req.body?.departmentId as string | undefined;
      const result = await queueService.callNext(getParam(req.params.id), departmentId);
      const message = result.calledToken ? `Token ${result.calledToken.tokenNumber} called` : 'No waiting tokens in queue';
      return sendSuccess(res, message, result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async skipToken(req: Request, res: Response) {
    try {
      const targetId = req.body.tokenId || getParam(req.params.id);
      const token = await queueService.updateTokenAction(targetId, 'skip');
      return sendSuccess(res, 'Token skipped', token);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async noShowToken(req: Request, res: Response) {
    try {
      const targetId = req.body.tokenId || getParam(req.params.id);
      const token = await queueService.updateTokenAction(targetId, 'no-show');
      return sendSuccess(res, 'Token marked no-show', token);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async recallToken(req: Request, res: Response) {
    try {
      const targetId = req.body.tokenId || getParam(req.params.id);
      const token = await queueService.updateTokenAction(targetId, 'recall');
      return sendSuccess(res, 'Token recalled', token);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
