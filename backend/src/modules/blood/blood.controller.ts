import { Request, Response, NextFunction } from 'express';
import { BloodService } from './blood.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class BloodController {
  private bloodService: BloodService;

  constructor() {
    this.bloodService = new BloodService();
  }

  findEmergencyBlood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.bloodService.findEmergencyBlood(req.query as any);
      sendSuccess(res, 'Emergency blood availability search completed successfully', {
        count: results.length,
        hospitals: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getHospitalInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const data = await this.bloodService.getHospitalInventory(hospitalId);
      sendSuccess(res, 'Hospital blood inventory retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };

  createOrUpdateBloodInventory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const item = await this.bloodService.upsertBloodGroup(hospitalId, req.body);
      sendSuccess(res, 'Blood inventory updated successfully', { inventoryItem: item }, 200);
    } catch (error) {
      next(error);
    }
  };

  updateBloodGroup = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const bloodGroup = Array.isArray(req.params.bloodGroup) ? req.params.bloodGroup[0] : req.params.bloodGroup;
      const item = await this.bloodService.updateBloodGroup(hospitalId, bloodGroup, req.body);
      sendSuccess(res, 'Blood group availability updated successfully', { inventoryItem: item });
    } catch (error) {
      next(error);
    }
  };

  deleteBloodGroup = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const bloodGroup = Array.isArray(req.params.bloodGroup) ? req.params.bloodGroup[0] : req.params.bloodGroup;
      await this.bloodService.deleteBloodInventory(hospitalId, bloodGroup);
      sendSuccess(res, 'Blood group inventory item deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilityId = (req.query.facilityId as string) || (req.query.hospitalId as string);
      if (facilityId) {
        const data = await this.bloodService.getHospitalInventory(facilityId);
        sendSuccess(res, 'Blood inventory retrieved', data);
        return;
      }
      const results = await this.bloodService.findEmergencyBlood({ latitude: 22.3039, longitude: 70.8022, radius: 100 } as any);
      sendSuccess(res, 'Blood inventory summary retrieved', results);
    } catch (error) {
      next(error);
    }
  };
}
