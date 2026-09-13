import { Request, Response } from 'express';
import { SearchService } from './search.service';
import { sendSuccess, sendError } from '../../utils/response';

const searchService = new SearchService();

export class SearchController {
  async unifiedSearch(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const results = await searchService.unifiedSearch(q);
      return sendSuccess(res, 'Unified search results', results);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async searchFacilities(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const list = await searchService.searchFacilities(q);
      return sendSuccess(res, 'Facilities search results', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async searchDoctors(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const list = await searchService.searchDoctors(q);
      return sendSuccess(res, 'Doctors search results', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async searchEquipment(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const list = await searchService.searchEquipment(q);
      return sendSuccess(res, 'Equipment search results', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
