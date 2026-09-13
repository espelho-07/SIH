import { Request, Response } from 'express';
import { BedService } from './bed.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const bedService = new BedService();

export class BedController {
  async getBeds(req: Request, res: Response) {
    try {
      const beds = await bedService.getBeds(req.query);
      return sendSuccess(res, 'Beds list retrieved', beds);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getBedById(req: Request, res: Response) {
    try {
      const bed = await bedService.getBedById(getParam(req.params.id));
      if (!bed) return sendError(res, 'Bed not found', 404);
      return sendSuccess(res, 'Bed details', bed);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createBed(req: Request, res: Response) {
    try {
      const bed = await bedService.createBed(req.body);
      return sendSuccess(res, 'Bed record created', bed, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateBed(req: Request, res: Response) {
    try {
      const bed = await bedService.updateBed(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Bed record updated', bed);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteBed(req: Request, res: Response) {
    try {
      await bedService.deleteBed(getParam(req.params.id));
      return sendSuccess(res, 'Bed record deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const bed = await bedService.updateStatus(getParam(req.params.id), req.body.status, req.body.patientId);
      return sendSuccess(res, 'Bed status updated', bed);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getBedSummary(req: Request, res: Response) {
    try {
      const facilityId = getParam(req.params.facilityId) || (req.query.facilityId as string);
      const summary = await bedService.getBedSummary(facilityId);
      return sendSuccess(res, 'Facility bed summary breakdown', summary);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
