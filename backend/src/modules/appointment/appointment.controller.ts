import { Response, NextFunction } from 'express';
import { AppointmentService } from './appointment.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  getDoctorSlots = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doctorId = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
      const date = req.query.date as string;
      const slots = await this.appointmentService.getDoctorAvailableSlots(doctorId, date);
      sendSuccess(res, 'Doctor time slots fetched successfully', slots);
    } catch (error) {
      next(error);
    }
  };

  bookAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user?.userId || req.body.patientId || 'usr_pat_01';
      const appointment = await this.appointmentService.bookAppointment(patientId, req.body);
      sendSuccess(res, 'Appointment booked successfully', appointment, 201);
    } catch (error) {
      next(error);
    }
  };

  getMyAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.query.patientId as string || req.user?.userId || 'usr_pat_01';
      const appointments = await this.appointmentService.getPatientAppointments(patientId, req.query as any);
      sendSuccess(res, 'Patient appointments fetched successfully', appointments);
    } catch (error) {
      next(error);
    }
  };

  getAppointmentDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = Array.isArray(req.params.appointmentId)
        ? req.params.appointmentId[0]
        : req.params.appointmentId;
      const appointment = await this.appointmentService.getAppointmentDetails(
        appointmentId,
        req.user?.userId || 'usr_pat_01',
        req.user?.role || 'PATIENT'
      );
      sendSuccess(res, 'Appointment details retrieved successfully', appointment);
    } catch (error) {
      next(error);
    }
  };

  checkInAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = Array.isArray(req.params.appointmentId)
        ? req.params.appointmentId[0]
        : req.params.appointmentId;
      const result = await this.appointmentService.checkInAppointment(appointmentId);
      sendSuccess(res, `Patient ${result.appointment.patientName} checked in. Token ${result.token.tokenNumber} issued.`, result);
    } catch (error) {
      next(error);
    }
  };

  cancelAppointment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = Array.isArray(req.params.appointmentId)
        ? req.params.appointmentId[0]
        : req.params.appointmentId;
      const appointment = await this.appointmentService.cancelAppointment(
        appointmentId,
        req.user?.userId || 'usr_pat_01'
      );
      sendSuccess(res, 'Appointment cancelled successfully', appointment);
    } catch (error) {
      next(error);
    }
  };

  adminGetAppointments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointments = await this.appointmentService.adminGetAllAppointments(req.query);
      sendSuccess(res, 'All appointments fetched successfully', appointments);
    } catch (error) {
      next(error);
    }
  };

  adminUpdateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointmentId = Array.isArray(req.params.appointmentId)
        ? req.params.appointmentId[0]
        : req.params.appointmentId;
      const { status } = req.body;
      const appointment = await this.appointmentService.adminUpdateAppointmentStatus(
        appointmentId,
        status
      );
      sendSuccess(res, 'Appointment status updated successfully', appointment);
    } catch (error) {
      next(error);
    }
  };
}
