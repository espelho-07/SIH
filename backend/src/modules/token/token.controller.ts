import { Response, NextFunction } from 'express';
import { TokenService } from './token.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class TokenController {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = new TokenService();
  }

  requestToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user?.userId || 'usr_pat_01';
      const token = await this.tokenService.requestToken(patientId, req.body);
      sendSuccess(res, `Digital Token ${token.tokenNumber || ''} generated successfully`, token, 201);
    } catch (error) {
      next(error);
    }
  };

  getMyTokens = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientId = req.user?.userId || 'usr_pat_01';
      const tokens = await this.tokenService.getPatientTokens(patientId, req.query as any);
      sendSuccess(res, 'Patient tokens fetched successfully', tokens);
    } catch (error) {
      next(error);
    }
  };

  getTokenById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenId = Array.isArray(req.params.tokenId) ? req.params.tokenId[0] : req.params.tokenId;
      const details = await this.tokenService.getTokenDetails(tokenId, req.user?.userId, req.user?.role);
      sendSuccess(res, 'Token details fetched successfully', details);
    } catch (error) {
      next(error);
    }
  };

  getDoctorQueue = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const doctorId = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
      const queue = await this.tokenService.getDoctorQueue(hospitalId, doctorId);
      sendSuccess(res, 'Doctor queue fetched successfully', { queue });
    } catch (error) {
      next(error);
    }
  };

  updateTokenStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenId = Array.isArray(req.params.tokenId) ? req.params.tokenId[0] : req.params.tokenId;
      const { status } = req.body;
      const token = await this.tokenService.updateTokenStatus(tokenId, status);
      sendSuccess(res, 'Token status updated successfully', token);
    } catch (error) {
      next(error);
    }
  };

  callNextPatient = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hospitalId = Array.isArray(req.params.hospitalId) ? req.params.hospitalId[0] : req.params.hospitalId;
      const doctorId = Array.isArray(req.params.doctorId) ? req.params.doctorId[0] : req.params.doctorId;
      const token = await this.tokenService.callNextPatientInQueue(hospitalId, doctorId);
      sendSuccess(res, 'Next patient called successfully', token);
    } catch (error) {
      next(error);
    }
  };

  getAllTokens = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokens = await this.tokenService.getAllTokens(req.query);
      sendSuccess(res, 'Tokens list fetched successfully', tokens);
    } catch (error) {
      next(error);
    }
  };

  deleteToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenId = Array.isArray(req.params.tokenId) ? req.params.tokenId[0] : req.params.tokenId;
      await this.tokenService.deleteToken(tokenId);
      sendSuccess(res, 'Token deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  cancelToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tokenId = Array.isArray(req.params.tokenId) ? req.params.tokenId[0] : req.params.tokenId;
      const token = await this.tokenService.updateTokenStatus(tokenId, 'CANCELLED');
      sendSuccess(res, 'Token cancelled successfully', token);
    } catch (error) {
      next(error);
    }
  };
}
