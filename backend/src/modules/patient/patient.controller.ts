import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { PatientService } from './patient.service';
import { ReferralService } from '../referral/referral.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const patientService = new PatientService();
const referralService = new ReferralService();

export class PatientController {
  async getMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await patientService.getPatientByUserId(req.user!.userId);
      return sendSuccess(res, 'Patient profile retrieved', patient);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getMyReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const referrals = await referralService.getReferrals({ patientId: req.user!.userId });
      return sendSuccess(res, 'Patient referrals retrieved', referrals);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await patientService.updatePatientByUserId(req.user!.userId, req.body);
      return sendSuccess(res, 'Patient profile updated', patient);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPatientById(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await patientService.getPatientById(getParam(req.params.patientId));
      if (!patient) return sendError(res, 'Patient not found', 404);
      return sendSuccess(res, 'Patient details retrieved', patient);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updatePatientById(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await patientService.updatePatientById(getParam(req.params.patientId), req.body);
      return sendSuccess(res, 'Patient details updated', patient);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deletePatientById(req: AuthenticatedRequest, res: Response) {
    try {
      await patientService.deletePatientById(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async registerPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const patient = await patientService.registerPatient(req.body);
      return sendSuccess(res, 'Patient registered successfully', patient, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAllPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await patientService.getAllPatients(req.query);
      return sendSuccess(res, 'Patient list retrieved', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async searchPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const patients = await patientService.searchPatients(query);
      return sendSuccess(res, 'Search results', patients);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
