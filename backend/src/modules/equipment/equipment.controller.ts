import { Request, Response } from 'express';
import { EquipmentService } from './equipment.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const equipmentService = new EquipmentService();

export class EquipmentController {
  async getEquipment(req: Request, res: Response) {
    try {
      const list = await equipmentService.getEquipment(req.query);
      return sendSuccess(res, 'Equipment catalog list', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getEquipmentById(req: Request, res: Response) {
    try {
      const eq = await equipmentService.getEquipmentById(getParam(req.params.id));
      if (!eq) return sendError(res, 'Equipment record not found', 404);
      return sendSuccess(res, 'Equipment details', eq);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createEquipment(req: Request, res: Response) {
    try {
      const hospitalId = getParam(req.params.facilityId) || req.body.hospitalId;
      const eq = await equipmentService.createEquipment({ ...req.body, hospitalId });
      return sendSuccess(res, 'Equipment record added', eq, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateEquipment(req: Request, res: Response) {
    try {
      const eq = await equipmentService.updateEquipment(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Equipment updated', eq);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const eq = await equipmentService.updateStatus(getParam(req.params.id), req.body.status, req.body.notes);
      return sendSuccess(res, 'Equipment operational status updated', eq);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteEquipment(req: Request, res: Response) {
    try {
      await equipmentService.deleteEquipment(getParam(req.params.id));
      return sendSuccess(res, 'Equipment record deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
