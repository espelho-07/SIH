import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get('/preferences', controller.getPreferences);
router.put('/preferences', controller.updatePreferences);

router.get('/unread', controller.getUnread);
router.patch('/read-all', controller.markAllAsRead);

router.get('/', controller.getNotifications);
router.post('/', controller.createNotification);
router.get('/:id', controller.getNotificationById);
router.put('/:id', controller.updateNotification);
router.patch('/:id/read', controller.markAsRead);
router.delete('/:id', controller.deleteNotification);

export default router;
