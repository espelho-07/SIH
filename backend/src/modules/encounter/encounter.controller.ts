import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { EncounterService } from './encounter.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const encounterService = new EncounterService();

export class EncounterController {
  async createEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.createEncounter(req.body);
      return sendSuccess(res, 'Clinical encounter created', encounter, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAllEncounters(req: AuthenticatedRequest, res: Response) {
    try {
      const encounters = await encounterService.getAllEncounters(req.query);
      return sendSuccess(res, 'Encounters list retrieved', encounters);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getEncounterById(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.getEncounterById(getParam(req.params.id));
      if (!encounter) return sendError(res, 'Encounter not found', 404);
      return sendSuccess(res, 'Encounter details', encounter);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.updateEncounter(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Encounter updated', encounter);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      await encounterService.deleteEncounter(getParam(req.params.id));
      return sendSuccess(res, 'Encounter deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async completeEncounter(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.completeEncounter(getParam(req.params.id));
      return sendSuccess(res, 'Encounter completed', encounter);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPatientEncounters(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await encounterService.getPatientEncounters(getParam(req.params.patientId));
      return sendSuccess(res, 'Patient encounter history', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async addVitals(req: AuthenticatedRequest, res: Response) {
    try {
      const vitals = await encounterService.addVitals(getParam(req.params.encounterId), req.body);
      return sendSuccess(res, 'Vitals added to encounter', vitals);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async addDiagnosis(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.addDiagnosis(getParam(req.params.encounterId), req.body);
      return sendSuccess(res, 'Clinician diagnosis recorded', encounter);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async addPrescription(req: AuthenticatedRequest, res: Response) {
    try {
      const encounter = await encounterService.addPrescription(getParam(req.params.encounterId), req.body);
      return sendSuccess(res, 'Prescription added', encounter);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPendingPrescriptions(req: AuthenticatedRequest, res: Response) {
    try {
      const pending = await encounterService.getPendingPharmacyPrescriptions();
      return sendSuccess(res, 'Pending pharmacy prescriptions', pending);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async dispensePrescription(req: AuthenticatedRequest, res: Response) {
    try {
      const index = req.body.index || 0;
      const dispensed = await encounterService.dispensePrescription(getParam(req.params.id || req.params.prescriptionId), index);
      return sendSuccess(res, 'Medicine dispensed', dispensed);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getDiagnosticOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const orders = await encounterService.getDiagnosticOrders();
      return sendSuccess(res, 'Diagnostic orders retrieved', orders);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async collectSample(req: AuthenticatedRequest, res: Response) {
    try {
      const id = getParam(req.params.orderId || req.params.id);
      const updated = await encounterService.updateDiagnosticStatus(id, 0, 'SAMPLE_COLLECTED');
      return sendSuccess(res, 'Diagnostic sample collected', updated);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async processSample(req: AuthenticatedRequest, res: Response) {
    try {
      const id = getParam(req.params.orderId || req.params.id);
      const updated = await encounterService.updateDiagnosticStatus(id, 0, 'COMPLETED', req.body.resultSummary);
      return sendSuccess(res, 'Diagnostic order processed', updated);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
