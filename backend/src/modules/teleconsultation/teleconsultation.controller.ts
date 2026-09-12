import { Response, NextFunction } from 'express';
import { TeleconsultationService } from './teleconsultation.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class TeleconsultationController {
  private teleconsultationService: TeleconsultationService;

  constructor() {
    this.teleconsultationService = new TeleconsultationService();
  }

  requestTeleconsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user!.userId;
      const consultation = await this.teleconsultationService.requestTeleconsultation(patientId, req.body);
      sendSuccess(res, 'Teleconsultation requested successfully', { consultation }, 201);
    } catch (error) {
      next(error);
    }
  };

  getMyConsultations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user!.userId;
      const consultations = await this.teleconsultationService.getPatientConsultations(patientId, req.query as any);
      sendSuccess(res, 'Teleconsultations fetched successfully', { count: consultations.length, consultations });
    } catch (error) {
      next(error);
    }
  };

  getConsultationDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const details = await this.teleconsultationService.getConsultationDetails(
        consultationId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Teleconsultation details retrieved successfully', details);
    } catch (error) {
      next(error);
    }
  };

  acceptConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const consultation = await this.teleconsultationService.acceptConsultation(
        consultationId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Teleconsultation accepted successfully', { consultation });
    } catch (error) {
      next(error);
    }
  };

  rejectConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const consultation = await this.teleconsultationService.rejectConsultation(
        consultationId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Teleconsultation rejected successfully', { consultation });
    } catch (error) {
      next(error);
    }
  };

  startConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const consultation = await this.teleconsultationService.startConsultation(
        consultationId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Teleconsultation started and is now active', { consultation });
    } catch (error) {
      next(error);
    }
  };

  endConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const consultation = await this.teleconsultationService.endConsultation(
        consultationId,
        req.user!.userId,
        req.user!.role
      );
      sendSuccess(res, 'Teleconsultation ended successfully', { consultation });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const { message } = req.body;
      const savedMessage = await this.teleconsultationService.sendChatMessage(
        consultationId,
        req.user!.userId,
        message,
        req.user!.role
      );
      sendSuccess(res, 'Message sent successfully', { message: savedMessage }, 201);
    } catch (error) {
      next(error);
    }
  };

  getAllConsultations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultations = await this.teleconsultationService.getAllConsultations(req.query);
      sendSuccess(res, 'Consultations list retrieved', { count: consultations.length, consultations });
    } catch (error) {
      next(error);
    }
  };

  updateConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      const consultation = await this.teleconsultationService.updateConsultation(consultationId, req.body);
      sendSuccess(res, 'Consultation updated', { consultation });
    } catch (error) {
      next(error);
    }
  };

  deleteConsultation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const consultationId = Array.isArray(req.params.consultationId) ? req.params.consultationId[0] : req.params.consultationId;
      await this.teleconsultationService.deleteConsultation(consultationId);
      sendSuccess(res, 'Consultation deleted');
    } catch (error) {
      next(error);
    }
  };
}
