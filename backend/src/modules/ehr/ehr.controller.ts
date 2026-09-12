import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { EhrService } from './ehr.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const ehrService = new EhrService();

export class EhrController {
  async getTimeline(req: AuthenticatedRequest, res: Response) {
    try {
      const timeline = await ehrService.getTimeline(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient timeline retrieved', timeline);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getHealthRecord(req: AuthenticatedRequest, res: Response) {
    try {
      const record = await ehrService.getHealthRecord(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient health record', record);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getFhirExport(req: AuthenticatedRequest, res: Response) {
    try {
      const fhir = await ehrService.getFhirExport(getParam(req.params.patientId));
      return sendSuccess(res, 'FHIR bundle retrieved', fhir);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
