import { Request, Response, NextFunction } from 'express';
import { DoctorService } from './doctor.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { getParam } from '../../utils/params';

export class DoctorController {
  private doctorService: DoctorService;

  constructor() {
    this.doctorService = new DoctorService();
  }

  getAllDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctors = await this.doctorService.getAllDoctors(req.query as any);
      sendSuccess(res, 'Doctors fetched successfully', { count: doctors.length, doctors });
    } catch (error) {
      next(error);
    }
  };

  getAvailableDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const available = await this.doctorService.getAvailableDoctors(req.query as any);
      sendSuccess(res, 'Available doctors fetched successfully', { count: available.length, doctors: available });
    } catch (error) {
      next(error);
    }
  };

  getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = getParam(req.params.doctorId);
      const doctor = await this.doctorService.getDoctorById(doctorId);
      sendSuccess(res, 'Doctor retrieved successfully', { doctor });
    } catch (error) {
      next(error);
    }
  };

  getDoctorMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctor = await this.doctorService.getDoctorByUserId(req.user!.userId);
      sendSuccess(res, 'Doctor profile retrieved', doctor);
    } catch (error) {
      next(error);
    }
  };

  updateDoctorMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctor = await this.doctorService.getDoctorByUserId(req.user!.userId);
      if (doctor) {
        const updated = await this.doctorService.updateDoctor(doctor._id.toString(), req.body);
        sendSuccess(res, 'Doctor profile updated', updated);
      } else {
        sendSuccess(res, 'Doctor profile not found');
      }
    } catch (error) {
      next(error);
    }
  };

  updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.doctorService.updateDoctorAvailability(getParam(req.params.id), req.body.status || 'AVAILABLE');
      sendSuccess(res, 'Doctor availability updated', updated);
    } catch (error) {
      next(error);
    }
  };

  getRosters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rosters = await this.doctorService.getRosters(req.query);
      sendSuccess(res, 'Doctor rosters fetched', rosters);
    } catch (error) {
      next(error);
    }
  };

  getRosterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roster = await this.doctorService.getRosterById(getParam(req.params.id));
      sendSuccess(res, 'Doctor roster details', roster);
    } catch (error) {
      next(error);
    }
  };

  createRoster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roster = await this.doctorService.createRoster(req.body);
      sendSuccess(res, 'Doctor roster created', roster, 201);
    } catch (error) {
      next(error);
    }
  };

  updateRoster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roster = await this.doctorService.updateRoster(getParam(req.params.id), req.body);
      sendSuccess(res, 'Doctor roster updated', roster);
    } catch (error) {
      next(error);
    }
  };

  deleteRoster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.doctorService.deleteRoster(getParam(req.params.id));
      sendSuccess(res, 'Doctor roster deleted');
    } catch (error) {
      next(error);
    }
  };

  createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctor = await this.doctorService.createDoctor(req.body);
      sendSuccess(res, 'Doctor created successfully', { doctor }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = getParam(req.params.doctorId || req.params.id);
      const doctor = await this.doctorService.updateDoctor(doctorId, req.body);
      sendSuccess(res, 'Doctor updated successfully', { doctor });
    } catch (error) {
      next(error);
    }
  };

  deleteDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = getParam(req.params.doctorId || req.params.id);
      await this.doctorService.deleteDoctor(doctorId);
      sendSuccess(res, 'Doctor deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
