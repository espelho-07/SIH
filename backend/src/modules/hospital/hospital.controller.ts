import { Request, Response, NextFunction } from 'express';
import { HospitalService } from './hospital.service';
import { sendSuccess } from '../../utils/response';

export class HospitalController {
  private hospitalService: HospitalService;

  constructor() {
    this.hospitalService = new HospitalService();
  }

  getAllHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitals = await this.hospitalService.getAllHospitals(req.query as any);
      sendSuccess(res, 'Hospitals fetched successfully', { hospitals });
    } catch (error) {
      next(error);
    }
  };

  getNearbyHospitals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nearby = await this.hospitalService.getNearbyHospitals(req.query as any);
      sendSuccess(res, 'Nearby hospitals fetched successfully', {
        count: nearby.length,
        hospitals: nearby,
      });
    } catch (error) {
      next(error);
    }
  };

  getNearbyHospitalsByTreatment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitals = await this.hospitalService.getNearbyHospitalsByTreatment(req.query as any);
      sendSuccess(res, 'Nearest treatment-wise hospitals retrieved successfully', {
        count: hospitals.length,
        hospitals,
      });
    } catch (error) {
      next(error);
    }
  };

  getTreatmentCosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const costs = await this.hospitalService.getTreatmentCosts(req.query as any);
      sendSuccess(res, 'Healthcare treatment costs retrieved successfully', {
        count: costs.length,
        costs,
      });
    } catch (error) {
      next(error);
    }
  };

  getHospitalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const hospital = await this.hospitalService.getHospitalById(hospitalId);
      sendSuccess(res, 'Hospital retrieved successfully', { hospital });
    } catch (error) {
      next(error);
    }
  };

  getHospitalDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const details = await this.hospitalService.getHospitalCompleteDetails(hospitalId);
      sendSuccess(res, 'Hospital details retrieved successfully', details);
    } catch (error) {
      next(error);
    }
  };

  getHospitalDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const details = await this.hospitalService.getHospitalCompleteDetails(hospitalId);
      sendSuccess(res, 'Hospital doctors retrieved successfully', { doctors: details.doctors });
    } catch (error) {
      next(error);
    }
  };

  getHospitalMedicines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const details = await this.hospitalService.getHospitalCompleteDetails(hospitalId);
      sendSuccess(res, 'Hospital medicines retrieved successfully', { medicines: details.medicines });
    } catch (error) {
      next(error);
    }
  };

  getHospitalServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const details = await this.hospitalService.getHospitalCompleteDetails(hospitalId);
      sendSuccess(res, 'Hospital services retrieved successfully', { services: details.services });
    } catch (error) {
      next(error);
    }
  };

  createHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospital = await this.hospitalService.createHospital(req.body);
      sendSuccess(res, 'Hospital created successfully', { hospital }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const hospital = await this.hospitalService.updateHospital(hospitalId, req.body);
      sendSuccess(res, 'Hospital updated successfully', { hospital });
    } catch (error) {
      next(error);
    }
  };

  deleteHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      await this.hospitalService.deleteHospital(hospitalId);
      sendSuccess(res, 'Hospital deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
