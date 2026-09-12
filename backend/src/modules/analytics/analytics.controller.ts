import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getFacilityAnalytics(req: Request, res: Response) {
    try {
      const facilityId = getParam(req.params.facilityId);
      const data = await analyticsService.getFacilityAnalytics(facilityId);
      return sendSuccess(res, 'Facility analytics', data);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getDiseaseTrends(req: Request, res: Response) {
    try {
      const trends = await analyticsService.getDiseaseTrends();
      return sendSuccess(res, 'Disease surveillance trends', trends);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getOutbreakAlerts(req: Request, res: Response) {
    try {
      const alerts = await analyticsService.getOutbreakAlerts();
      return sendSuccess(res, 'Epidemic outbreak alerts', alerts);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getEpidemicHeatmap(req: Request, res: Response) {
    try {
      const heatmap = await analyticsService.getEpidemicHeatmap();
      return sendSuccess(res, 'District epidemic heatmap', heatmap);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
