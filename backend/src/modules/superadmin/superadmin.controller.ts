import { Request, Response } from 'express';
import { SuperAdminService } from './superadmin.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const superAdminService = new SuperAdminService();

export class SuperAdminController {
  async getDashboard(req: Request, res: Response) {
    try {
      const data = await superAdminService.getDashboard();
      return sendSuccess(res, 'Super Admin Technical Dashboard', data);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getSystemHealth(req: Request, res: Response) {
    try {
      const health = await superAdminService.getSystemHealth();
      return sendSuccess(res, 'System Health Metrics', health);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await superAdminService.getUsers();
      return sendSuccess(res, 'User accounts retrieved', users);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getRoles(req: Request, res: Response) {
    try {
      const roles = await superAdminService.getRoles();
      return sendSuccess(res, 'Role permission matrix', roles);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAiModels(req: Request, res: Response) {
    try {
      const models = await superAdminService.getAiModels();
      return sendSuccess(res, 'AI model registry', models);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getConfig(req: Request, res: Response) {
    try {
      const config = await superAdminService.getConfig();
      return sendSuccess(res, 'System Configuration', config);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateConfig(req: Request, res: Response) {
    try {
      const resData = await superAdminService.updateConfig(req.body);
      return sendSuccess(res, 'Config updated', resData);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deployModel(req: Request, res: Response) {
    try {
      const result = await superAdminService.deployModel(getParam(req.params.id || req.params.modelId));
      return sendSuccess(res, 'AI model deployed', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async rollbackModel(req: Request, res: Response) {
    try {
      const result = await superAdminService.rollbackModel(getParam(req.params.id || req.params.modelId));
      return sendSuccess(res, 'AI model rolled back', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await superAdminService.getAuditLogs(req.query);
      return sendSuccess(res, 'System audit logs', logs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
