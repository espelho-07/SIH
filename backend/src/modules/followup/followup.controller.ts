import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { FollowupService } from './followup.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const followupService = new FollowupService();

export class FollowupController {
  async createFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.createFollowup(req.body);
      return sendSuccess(res, 'Followup task created', followup, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getFollowups(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await followupService.getFollowups(req.query);
      return sendSuccess(res, 'Followups list', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getFollowupById(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.getFollowupById(getParam(req.params.id));
      if (!followup) return sendError(res, 'Followup not found', 404);
      return sendSuccess(res, 'Followup details', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.updateFollowup(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Followup updated', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      await followupService.deleteFollowup(getParam(req.params.id));
      return sendSuccess(res, 'Followup deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async assignFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const update: any = {};
      if (req.body.ashaId) update.assignedAshaId = req.body.ashaId;
      if (req.body.doctorId) update.assignedDoctorId = req.body.doctorId;
      const followup = await followupService.updateFollowup(getParam(req.params.id), update);
      return sendSuccess(res, 'Followup assigned', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async completeFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.updateStatus(getParam(req.params.id), 'COMPLETED', req.body.notes);
      return sendSuccess(res, 'Followup completed', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async closeFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.updateStatus(getParam(req.params.id), 'CANCELLED');
      return sendSuccess(res, 'Followup closed', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async rescheduleFollowup(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.reschedule(getParam(req.params.id), new Date(req.body.scheduledDate));
      return sendSuccess(res, 'Followup rescheduled', followup);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createFromReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const followup = await followupService.createFromReferral(
        getParam(req.params.id),
        new Date(req.body.scheduledDate || Date.now() + 86400000 * 3),
        req.body.reason
      );
      return sendSuccess(res, 'Referral follow-up scheduled', followup, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
