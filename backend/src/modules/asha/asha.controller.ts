import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';
import {
  AshaPatientModel,
  AshaVisitModel,
  FollowUpTaskModel,
  FrontlineReferralModel,
  ScreeningSessionModel,
} from '../../models/Asha';

export class AshaController {
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const patientCount = await AshaPatientModel.countDocuments();
      const highRiskCount = await AshaPatientModel.countDocuments({ isHighRisk: true });
      const pendingVisits = await AshaVisitModel.countDocuments({ isCompleted: false });
      const pendingTasks = await FollowUpTaskModel.countDocuments({ isCompleted: false });

      return sendSuccess(res, 'ASHA dashboard data retrieved', {
        patientCount,
        highRiskCount,
        pendingVisits,
        pendingTasks,
      });
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, 'ASHA profile retrieved', {
      id: req.user?.userId || 'usr_asha_01',
      name: 'Sunita Devi',
      role: 'ASHA',
      district: 'Gandhinagar',
      facilityName: 'Pethapur Subcentre',
      phone: '9876543212',
    });
  }

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    return sendSuccess(res, 'ASHA profile updated', req.body);
  }

  // Patients
  async getPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const filter: any = {};
      if (req.query.isHighRisk === 'true') {
        filter.isHighRisk = true;
      }
      const patients = await AshaPatientModel.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, 'ASHA assigned patients retrieved', patients);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPatientById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = getParam(req.params.patientId);
      const patient = await AshaPatientModel.findOne({ $or: [{ id }, { _id: id }] });
      if (!patient) return sendError(res, 'Patient not found', 404);
      return sendSuccess(res, 'Assigned patient details', patient);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      const newPatient = await AshaPatientModel.create({
        ...data,
        id: data.id || `asha_p_${Date.now()}`,
        ashaId: req.user?.userId || 'usr_asha_01',
        ashaName: 'Sunita Devi',
      });
      return sendSuccess(res, 'Citizen registered successfully by ASHA worker', newPatient, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updatePatient(req: AuthenticatedRequest, res: Response) {
    try {
      const id = getParam(req.params.patientId);
      const updated = await AshaPatientModel.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        req.body,
        { new: true }
      );
      return sendSuccess(res, 'Patient details updated', updated);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  // Visits
  async getVisits(req: AuthenticatedRequest, res: Response) {
    try {
      const visits = await AshaVisitModel.find().sort({ visitDate: 1, createdAt: -1 });
      return sendSuccess(res, 'ASHA field visits retrieved', visits);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createVisit(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      const newVisit = await AshaVisitModel.create({
        ...data,
        id: data.id || `vis_${Date.now()}`,
        isCompleted: false,
        status: data.status || 'SCHEDULED',
      });
      return sendSuccess(res, 'Home field visit scheduled successfully', newVisit, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateVisit(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.body.id || getParam(req.params.visitId);
      const updateData = { ...req.body };
      if (updateData.isCompleted) {
        updateData.completedAt = updateData.completedAt || new Date().toISOString();
        updateData.status = 'COMPLETED';
      }
      const updated = await AshaVisitModel.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updateData,
        { new: true, upsert: true }
      );
      return sendSuccess(res, 'Home visit record updated', updated);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  // Follow-up Tasks
  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const tasks = await FollowUpTaskModel.find().sort({ dueDate: 1 });
      return sendSuccess(res, 'Frontline follow-up tasks retrieved', tasks);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.body.id || getParam(req.params.id);
      const updateData: any = { ...req.body };
      if (updateData.isCompleted) {
        updateData.completedAt = updateData.completedAt || new Date().toISOString();
      }
      const updated = await FollowUpTaskModel.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        updateData,
        { new: true, upsert: true }
      );
      return sendSuccess(res, 'Follow-up task updated', updated);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  // Referrals
  async getReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const referrals = await FrontlineReferralModel.find().sort({ createdAt: -1 });
      return sendSuccess(res, 'Frontline referrals retrieved', referrals);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const data = req.body;
      const refNumber = `REF-PET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const newRef = await FrontlineReferralModel.create({
        ...data,
        id: data.id || `ref_fl_${Date.now()}`,
        referralNumber: data.referralNumber || refNumber,
        status: data.status || 'INITIATED',
        createdAt: new Date().toISOString(),
      });
      return sendSuccess(res, 'Frontline referral dispatched to health facility', newRef, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  // Screenings
  async createScreening(req: AuthenticatedRequest, res: Response) {
    try {
      const session = await ScreeningSessionModel.create({
        ...req.body,
        id: req.body.id || `scr_${Date.now()}`,
      });
      return sendSuccess(res, 'Community screening logged and risk profile generated', session, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
