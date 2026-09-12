import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getDepartments(req: Request, res: Response) {
    try {
      const deps = await departmentService.getAllDepartments();
      return sendSuccess(res, 'Departments retrieved successfully', deps);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getDepartmentById(req: Request, res: Response) {
    try {
      const dep = await departmentService.getDepartmentById(getParam(req.params.id));
      if (!dep) return sendError(res, 'Department not found', 404);
      return sendSuccess(res, 'Department details', dep);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createDepartment(req: Request, res: Response) {
    try {
      const dep = await departmentService.createDepartment(req.body);
      return sendSuccess(res, 'Department created', dep, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateDepartment(req: Request, res: Response) {
    try {
      const dep = await departmentService.updateDepartment(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Department updated', dep);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteDepartment(req: Request, res: Response) {
    try {
      await departmentService.deleteDepartment(getParam(req.params.id));
      return sendSuccess(res, 'Department deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getSpecialties(req: Request, res: Response) {
    try {
      const specs = await departmentService.getSpecialties();
      return sendSuccess(res, 'Specialties catalog', specs);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
