import { Router } from 'express';
import { OperationsController } from './operations.controller';

const router = Router();
const controller = new OperationsController();

// 1. Facility Operational Summary
router.get('/', controller.getSummary);

// 2. Operational Status
router.patch('/status', controller.updateStatus);

// 3. Department Services
router.get('/services', controller.getServices);
router.patch('/services/:serviceId', controller.updateServiceStatus);

// 4. Announcements
router.get('/announcements', controller.getAnnouncements);
router.post('/announcements', controller.createAnnouncement);

// 5. Operational Issues
router.get('/issues', controller.getIssues);
router.patch('/issues/:issueId/resolve', controller.resolveIssue);

// 6. Staff Duty
router.get('/staff-duty', controller.getStaffDuty);

// 7. Queue Delay Broadcast
router.post('/queues/delay', controller.broadcastQueueDelay);

export default router;
