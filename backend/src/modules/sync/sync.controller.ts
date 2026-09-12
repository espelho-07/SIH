import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SyncService } from './sync.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const syncService = new SyncService();

export class SyncController {
  async bootstrap(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await syncService.bootstrap(req.user!.userId);
      return sendSuccess(res, 'Offline sync bootstrap dataset', data);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async pushMutations(req: AuthenticatedRequest, res: Response) {
    try {
      const mutations = req.body.mutations || [req.body];
      const result = await syncService.pushMutations(req.user!.userId, mutations);
      return sendSuccess(res, 'Offline mutations pushed', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async pullDelta(req: AuthenticatedRequest, res: Response) {
    try {
      const lastSync = req.query.lastSyncTimestamp as string;
      const delta = await syncService.pullDelta(req.user!.userId, lastSync);
      return sendSuccess(res, 'Delta sync dataset', delta);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async ackSync(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, 'Sync acknowledged', { status: 'ACKNOWLEDGED', serverTimestamp: new Date() });
  }

  async getSyncStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = await syncService.getSyncStatus(req.user!.userId);
      return sendSuccess(res, 'Sync status', status);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getConflicts(req: AuthenticatedRequest, res: Response) {
    try {
      const conflicts = await syncService.getConflicts(req.user!.userId);
      return sendSuccess(res, 'Sync conflicts list', conflicts);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async resolveConflict(req: AuthenticatedRequest, res: Response) {
    try {
      const resolved = await syncService.resolveConflict(getParam(req.params.id), req.body.strategy || 'SERVER_WINS');
      return sendSuccess(res, 'Conflict resolved', resolved);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
