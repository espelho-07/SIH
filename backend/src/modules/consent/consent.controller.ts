import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ConsentService } from './consent.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const consentService = new ConsentService();

export class ConsentController {
  async createConsent(req: AuthenticatedRequest, res: Response) {
    try {
      const consent = await consentService.createConsent(req.body.patientId || req.user!.userId, req.body);
      return sendSuccess(res, 'Consent recorded', consent, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getConsents(req: AuthenticatedRequest, res: Response) {
    try {
      const patientId = (req.query.patientId as string) || req.user!.userId;
      const consents = await consentService.getConsents(patientId);
      return sendSuccess(res, 'Consents list', consents);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getConsentById(req: AuthenticatedRequest, res: Response) {
    try {
      const consent = await consentService.getConsentById(getParam(req.params.id));
      if (!consent) return sendError(res, 'Consent not found', 404);
      return sendSuccess(res, 'Consent details', consent);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateConsent(req: AuthenticatedRequest, res: Response) {
    try {
      const consent = await consentService.updateConsent(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Consent record updated', consent);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteConsent(req: AuthenticatedRequest, res: Response) {
    try {
      await consentService.deleteConsent(getParam(req.params.id));
      return sendSuccess(res, 'Consent record deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async grantConsent(req: AuthenticatedRequest, res: Response) {
    try {
      const consent = await consentService.setGrantStatus(getParam(req.params.id), true);
      return sendSuccess(res, 'Consent granted', consent);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async revokeConsent(req: AuthenticatedRequest, res: Response) {
    try {
      const consent = await consentService.setGrantStatus(getParam(req.params.id), false);
      return sendSuccess(res, 'Consent revoked', consent);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async triggerBreakGlass(req: AuthenticatedRequest, res: Response) {
    try {
      const patientId = getParam(req.params.patientId);
      const log = await consentService.triggerBreakGlass(
        patientId,
        req.user!.userId,
        req.body.facilityId || patientId,
        req.body.reason
      );
      return sendSuccess(res, 'Emergency Break-Glass triggered and logged', log, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getBreakGlassLog(req: AuthenticatedRequest, res: Response) {
    try {
      const log = await consentService.getBreakGlassLog(getParam(req.params.id));
      return sendSuccess(res, 'Break-glass access log details', log);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAccessHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const history = await consentService.getAccessHistory(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient access history', history);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
