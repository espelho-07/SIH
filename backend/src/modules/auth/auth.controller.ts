import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      sendSuccess(res, 'Tokens refreshed successfully', tokens);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.sendOtp(req.body.phone);
      sendSuccess(res, 'OTP sent', result);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.verifyOtp(req.body.phone, req.body.otp);
      sendSuccess(res, 'OTP verified successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.getProfile(req.user!.userId);
      sendSuccess(res, 'User profile', profile);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.authService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, 'Profile updated', profile);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword);
      sendSuccess(res, 'Password changed', result);
    } catch (error) {
      next(error);
    }
  };

  generateAbha = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const abha = await this.authService.generateAbha(req.body.aadharNumber);
      sendSuccess(res, 'ABHA number generated', abha);
    } catch (error) {
      next(error);
    }
  };

  linkAbha = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.linkAbha(req.user!.userId, req.body.abhaId);
      sendSuccess(res, 'ABHA linked to patient profile', result);
    } catch (error) {
      next(error);
    }
  };
}
