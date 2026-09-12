import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { AppointmentController } from '../appointment/appointment.controller';
import { sendSuccess } from '../../utils/response';

export class AdminController {
  private adminService: AdminService;
  private appointmentController: AppointmentController;

  constructor() {
    this.adminService = new AdminService();
    this.appointmentController = new AppointmentController();
  }

  // Hospital management
  createHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospital = await this.adminService.createHospital(req.body);
      sendSuccess(res, 'Hospital created successfully', { hospital }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const hospital = await this.adminService.updateHospital(id, req.body);
      sendSuccess(res, 'Hospital updated successfully', { hospital });
    } catch (error) {
      next(error);
    }
  };

  deleteHospital = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.adminService.deleteHospital(id);
      sendSuccess(res, 'Hospital deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // Doctor management
  createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctor = await this.adminService.createDoctor(req.body);
      sendSuccess(res, 'Doctor created successfully', { doctor }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const doctor = await this.adminService.updateDoctor(id, req.body);
      sendSuccess(res, 'Doctor updated successfully', { doctor });
    } catch (error) {
      next(error);
    }
  };

  deleteDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.adminService.deleteDoctor(id);
      sendSuccess(res, 'Doctor deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // Medicine catalog management
  createMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicine = await this.adminService.createMedicine(req.body);
      sendSuccess(res, 'Medicine created successfully', { medicine }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const medicine = await this.adminService.updateMedicine(id, req.body);
      sendSuccess(res, 'Medicine updated successfully', { medicine });
    } catch (error) {
      next(error);
    }
  };

  deleteMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.adminService.deleteMedicine(id);
      sendSuccess(res, 'Medicine deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // Services management
  addHospitalService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const service = await this.adminService.addHospitalService(hospitalId, req.body);
      sendSuccess(res, 'Hospital service added successfully', { service }, 201);
    } catch (error) {
      next(error);
    }
  };

  updateHospitalService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const serviceId = Array.isArray(req.params.serviceId) ? req.params.serviceId[0] : req.params.serviceId;
      const service = await this.adminService.updateHospitalService(serviceId, req.body);
      sendSuccess(res, 'Hospital service updated successfully', { service });
    } catch (error) {
      next(error);
    }
  };

  // Medicine stock management
  updateMedicineStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const medicineId = Array.isArray(req.params.medicineId) ? req.params.medicineId[0] : req.params.medicineId;
      const stock = await this.adminService.updateMedicineStock(
        hospitalId,
        medicineId,
        req.body
      );
      sendSuccess(res, 'Medicine stock updated successfully', { stock });
    } catch (error) {
      next(error);
    }
  };

  // Admin Appointment endpoints
  getAppointments = (req: any, res: Response, next: NextFunction) => {
    return this.appointmentController.adminGetAppointments(req, res, next);
  };

  getAppointmentById = (req: any, res: Response, next: NextFunction) => {
    return this.appointmentController.getAppointmentDetails(req, res, next);
  };

  updateAppointmentStatus = (req: any, res: Response, next: NextFunction) => {
    return this.appointmentController.adminUpdateStatus(req, res, next);
  };
}
