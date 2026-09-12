import { Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { PatientChatService } from './patientChat.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { getParam } from '../../utils/params';

export class AIController {
  private aiService: AIService;
  private patientChatService: PatientChatService;

  constructor() {
    this.aiService = new AIService();
    this.patientChatService = new PatientChatService();
  }

  patientChat = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const { message, location } = req.body;
      const result = await this.patientChatService.processPatientChat(userId, role, message, location);
      sendSuccess(res, 'Patient chat processed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  analyzeSymptoms = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user!.userId;
      const analysis = await this.aiService.analyzeSymptoms(patientId, req.body);
      sendSuccess(res, 'Symptom analysis generated successfully', { analysis }, 200);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user!.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const history = await this.aiService.getPatientHistory(patientId, limit);
      sendSuccess(res, 'Symptom analysis history retrieved successfully', { count: history.length, history });
    } catch (error) {
      next(error);
    }
  };

  forecastDisease = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const disease = (req.query.disease as string) || req.body.disease;
      const resData = await this.aiService.forecastDisease(disease);
      sendSuccess(res, 'Disease demand forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  forecastSpecialist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resData = await this.aiService.forecastSpecialistDemand();
      sendSuccess(res, 'Specialist demand forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  forecastPatientLoad = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resData = await this.aiService.forecastPatientLoad();
      sendSuccess(res, 'Patient load forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  forecastBeds = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resData = await this.aiService.forecastBeds();
      sendSuccess(res, 'Bed demand forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  forecastAmbulance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resData = await this.aiService.forecastAmbulanceDemand();
      sendSuccess(res, 'Ambulance demand forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  forecastBlood = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resData = await this.aiService.forecastBloodDemand();
      sendSuccess(res, 'Blood demand forecast generated', resData);
    } catch (error) {
      next(error);
    }
  };

  detectAnomaly = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const area = (req.query.area as string) || req.body.area;
      const anomaly = await this.aiService.detectAnomaly(area);
      sendSuccess(res, 'Outbreak anomaly detection completed', anomaly);
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dash = await this.aiService.getUnifiedDashboard();
      sendSuccess(res, 'Unified AI Intelligence Dashboard', dash);
    } catch (error) {
      next(error);
    }
  };

  getModels = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const models = await this.aiService.getModels();
      sendSuccess(res, 'AI Model management catalog', models);
    } catch (error) {
      next(error);
    }
  };

  trainModel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aiService.trainModel(getParam(req.params.id));
      sendSuccess(res, 'Model training started', result);
    } catch (error) {
      next(error);
    }
  };

  activateModel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aiService.activateModel(getParam(req.params.id));
      sendSuccess(res, 'Model activated', result);
    } catch (error) {
      next(error);
    }
  };

  acknowledgeAlert = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alertId = getParam(req.params.alertId || req.params.id);
      sendSuccess(res, 'Alert acknowledged successfully', { acknowledged: true, alertId, notes: req.body.notes });
    } catch (error) {
      next(error);
    }
  };
}
