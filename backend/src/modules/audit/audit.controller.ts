import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const auditService = new AuditService();

export class AuditController {
  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await auditService.getAuditLogs(req.query);
      return sendSuccess(res, 'Audit logs retrieved', logs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAuditLogById(req: Request, res: Response) {
    try {
      const log = await auditService.getAuditLogById(getParam(req.params.id));
      if (!log) return sendError(res, 'Audit log entry not found', 404);
      return sendSuccess(res, 'Audit log details', log);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getLogsByPatient(req: Request, res: Response) {
    try {
      const logs = await auditService.getLogsByPatient(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient audit logs', logs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getLogsByUser(req: Request, res: Response) {
    try {
      const logs = await auditService.getLogsByUser(getParam(req.params.userId));
      return sendSuccess(res, 'User activity audit logs', logs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getLogsByFacility(req: Request, res: Response) {
    try {
      const logs = await auditService.getLogsByFacility(getParam(req.params.facilityId));
      return sendSuccess(res, 'Facility audit logs', logs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
