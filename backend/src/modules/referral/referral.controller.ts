import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ReferralService } from './referral.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const referralService = new ReferralService();

export class ReferralController {
  async createReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.createReferral(req.body, req.user!.userId);
      return sendSuccess(res, 'Referral created successfully', referral, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const referrals = await referralService.getReferrals(req.query);
      return sendSuccess(res, 'Referrals list retrieved', referrals);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getReferralById(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.getReferralById(getParam(req.params.id));
      if (!referral) return sendError(res, 'Referral not found', 404);
      return sendSuccess(res, 'Referral details', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateReferral(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Referral updated', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteReferral(req: AuthenticatedRequest, res: Response) {
    try {
      await referralService.deleteReferral(getParam(req.params.id));
      return sendSuccess(res, 'Referral deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getIncomingReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const facilityId = (req.query.facilityId as string) || getParam(req.params.id);
      const incoming = await referralService.getIncomingReferrals(facilityId);
      return sendSuccess(res, 'Incoming referrals queue', incoming);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async acceptReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'ACCEPTED', req.user!.userId, req.body.note);
      return sendSuccess(res, 'Referral accepted', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async rejectReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'REJECTED', req.user!.userId, req.body.note, {
        rejectionReason: req.body.reason,
      });
      return sendSuccess(res, 'Referral rejected', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async requestInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'MORE_INFO_REQUESTED', req.user!.userId, req.body.note, {
        additionalInfoRequest: req.body.requestDetails,
      });
      return sendSuccess(res, 'More information requested', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async reroute(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.reroute(getParam(req.params.id), req.body.newFacilityId, req.user!.userId, req.body.reason);
      return sendSuccess(res, 'Referral rerouted', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async autoReroute(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.autoReroute(getParam(req.params.id), req.user!.userId);
      return sendSuccess(res, 'Referral auto-rerouted', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async confirmArrival(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'ARRIVED', req.user!.userId, 'Patient arrived', {
        arrivedAt: new Date(),
      });
      return sendSuccess(res, 'Patient arrival confirmed', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async recordOutcome(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'COMPLETED', req.user!.userId, 'Consultation outcome recorded', {
        outcomeNotes: req.body.outcomeNotes,
      });
      return sendSuccess(res, 'Outcome recorded', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async closeReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const referral = await referralService.updateStatus(getParam(req.params.id), 'CLOSED', req.user!.userId, 'Referral closed');
      return sendSuccess(res, 'Referral closed', referral);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const events = await referralService.getTimelineEvents(getParam(req.params.id));
      return sendSuccess(res, 'Referral timeline events', events);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
