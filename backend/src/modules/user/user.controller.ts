import { Request, Response } from 'express';
import { UserService } from './user.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const result = await userService.getAllUsers(req.query);
      return sendSuccess(res, 'Users retrieved successfully', result);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(getParam(req.params.id));
      if (!user) return sendError(res, 'User not found', 404);
      return sendSuccess(res, 'User details retrieved', user);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      return sendSuccess(res, 'User created successfully', user, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(getParam(req.params.id), req.body);
      return sendSuccess(res, 'User updated successfully', user);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const user = await userService.updateStatus(getParam(req.params.id), req.body.isActive);
      return sendSuccess(res, 'User status updated', user);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(getParam(req.params.id));
      return sendSuccess(res, 'User deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getRoles(req: Request, res: Response) {
    const roles = await userService.getRoles();
    return sendSuccess(res, 'Available roles', roles);
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const activity = await userService.getUserActivity(getParam(req.params.id));
      return sendSuccess(res, 'User activity logs', activity);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
