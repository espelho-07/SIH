import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotificationService } from './notification.service';
import { sendSuccess, sendError } from '../../utils/response';
import { getParam } from '../../utils/params';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await notificationService.getNotifications(req.user!.userId);
      return sendSuccess(res, 'Notifications list', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getNotificationById(req: AuthenticatedRequest, res: Response) {
    try {
      const notif = await notificationService.getNotificationById(getParam(req.params.id));
      if (!notif) return sendError(res, 'Notification not found', 404);
      return sendSuccess(res, 'Notification details', notif);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async createNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const notif = await notificationService.createNotification({ ...req.body, userId: req.user!.userId });
      return sendSuccess(res, 'Notification created', notif, 201);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updateNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const notif = await notificationService.updateNotification(getParam(req.params.id), req.body);
      return sendSuccess(res, 'Notification updated', notif);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getUnread(req: AuthenticatedRequest, res: Response) {
    try {
      const list = await notificationService.getUnread(req.user!.userId);
      return sendSuccess(res, 'Unread notifications list', list);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const notif = await notificationService.markAsRead(getParam(req.params.id));
      return sendSuccess(res, 'Notification marked as read', notif);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const resData = await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, 'All notifications marked as read', resData);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      await notificationService.deleteNotification(getParam(req.params.id));
      return sendSuccess(res, 'Notification deleted');
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async getPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const pref = await notificationService.getPreferences(req.user!.userId);
      return sendSuccess(res, 'Notification preferences', pref);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const pref = await notificationService.updatePreferences(req.user!.userId, req.body);
      return sendSuccess(res, 'Notification preferences updated', pref);
    } catch (err: any) {
      return sendError(res, err.message);
    }
  }
}
