import { Request, Response } from 'express';
import { AmbulanceService } from './ambulance.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const ambulanceService = new AmbulanceService();

export class AmbulanceController {
  async getAmbulances(req: Request, res: Response) {
    try {
      const ambulances = await ambulanceService.getAmbulances(req.query);
      return sendSuccess(res, 'Ambulances list retrieved', ambulances);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getAmbulanceById(req: Request, res: Response) {
    try {
      const ambulance = await ambulanceService.getAmbulanceById(getParam(req.params.id));
      if (!ambulance) return sendError(res, 'Ambulance not found', 404);
      return sendSuccess(res, 'Ambulance details', ambulance);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createAmbulance(req: Request, res: Response) {
    try {
      const ambulance = await ambulanceService.createAmbulance(req.body);
      return sendSuccess(res, 'Ambulance record created', ambulance, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateAmbulance(req: Request, res: Response) {
    try {
      const ambulance = await ambulanceService.updateAmbulance(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Ambulance updated', ambulance);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteAmbulance(req: Request, res: Response) {
    try {
      await ambulanceService.deleteAmbulance(getParam(req.params.id));
      return sendSuccess(res, 'Ambulance record deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const ambulance = await ambulanceService.updateStatus(getParam(req.params.id), req.body.status);
      return sendSuccess(res, 'Ambulance status updated', ambulance);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const loc = await ambulanceService.updateLocation(getParam(req.params.id), req.body.latitude, req.body.longitude);
      return sendSuccess(res, 'Location updated', loc);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getLocation(req: Request, res: Response) {
    try {
      const loc = await ambulanceService.getLocation(getParam(req.params.id));
      return sendSuccess(res, 'Current ambulance location', loc);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createRequest(req: Request, res: Response) {
    try {
      const request = await ambulanceService.createRequest(req.body);
      return sendSuccess(res, 'Emergency ambulance request dispatched', request, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getRequests(req: Request, res: Response) {
    try {
      const requests = await ambulanceService.getRequests(req.query);
      return sendSuccess(res, 'Ambulance requests list', requests);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getRequestById(req: Request, res: Response) {
    try {
      const request = await ambulanceService.getRequestById(getParam(req.params.id));
      return sendSuccess(res, 'Ambulance request details', request);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async assignRequest(req: Request, res: Response) {
    try {
      const request = await ambulanceService.assignRequest(getParam(req.params.id), req.body.ambulanceId);
      return sendSuccess(res, 'Ambulance assigned', request);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateRequestStatus(req: Request, res: Response) {
    try {
      const request = await ambulanceService.updateRequestStatus(getParam(req.params.id), req.body.status || 'COMPLETED');
      return sendSuccess(res, 'Ambulance request status updated', request);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
