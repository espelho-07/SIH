import { Request, Response } from 'express';
import { FacilityService } from './facility.service';
import { HospitalService } from '../hospital/hospital.service';
import { BedService } from '../bed/bed.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const facilityService = new FacilityService();
const hospitalService = new HospitalService();
const bedService = new BedService();

export class FacilityController {
  async getAll(req: Request, res: Response) {
    try {
      const query: any = req.query || {};
      const facilities = await hospitalService.getAllHospitals(query as any);
      return sendSuccess(res, 'Facilities list retrieved', facilities);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = getParam(req.params.id);
      const facility = await hospitalService.getHospitalCompleteDetails(id);
      return sendSuccess(res, 'Facility details', facility);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getNearby(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string || req.query.latitude as string || '22.3039');
      const lng = parseFloat(req.query.lng as string || req.query.longitude as string || '70.8022');
      const radius = parseFloat(req.query.radiusKm as string || req.query.radius as string || '25');
      const nearby = await hospitalService.getNearbyHospitals({ latitude: lat, longitude: lng, radius } as any);
      return sendSuccess(res, 'Nearby facilities found', nearby);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async search(req: Request, res: Response) {
    try {
      const query = (req.query.query as string) || '';
      const facilities = await hospitalService.getAllHospitals({ search: query } as any);
      return sendSuccess(res, 'Facility search results', facilities);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getNearestFacility(req: Request, res: Response) {
    try {
      const result = await facilityService.findNearestFacility(req.query as any);
      return sendSuccess(res, result.message, result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async matchFacilities(req: Request, res: Response) {
    try {
      const result = await facilityService.matchFacilities(req.body);
      return sendSuccess(res, 'Facility matching score computed', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getBedSummary(req: Request, res: Response) {
    try {
      const facilityId = getParam(req.params.facilityId) || getParam(req.params.id);
      const summary = await bedService.getBedSummary(facilityId);
      return sendSuccess(res, 'Facility bed summary breakdown', summary);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateBedStatus(req: Request, res: Response) {
    try {
      const facilityId = getParam(req.params.facilityId) || getParam(req.params.id);
      const summary = await bedService.getBedSummary(facilityId);
      return sendSuccess(res, 'Facility bed status updated', summary);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getCapabilities(req: Request, res: Response) {
    try {
      const caps = await facilityService.getCapabilities(getParam(req.params.id));
      return sendSuccess(res, 'Facility capabilities retrieved', caps);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateCapabilities(req: Request, res: Response) {
    try {
      const result = await facilityService.updateCapabilities(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Capabilities updated', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createFacility(req: Request, res: Response) {
    try {
      const fac = await facilityService.createFacility(req.body);
      return sendSuccess(res, 'Facility created', fac, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateFacility(req: Request, res: Response) {
    try {
      const fac = await facilityService.updateFacility(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Facility updated', fac);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const fac = await facilityService.updateStatus(getParam(req.params.id), req.body.isActive);
      return sendSuccess(res, 'Facility status updated', fac);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteFacility(req: Request, res: Response) {
    try {
      await facilityService.deleteFacility(getParam(req.params.id));
      return sendSuccess(res, 'Facility deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
