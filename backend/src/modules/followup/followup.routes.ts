import { Router } from 'express';
import { FollowupController } from './followup.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new FollowupController();

router.use(authenticate);

router.post('/referrals/:id/create-followup', controller.createFromReferral);

router.get('/', controller.getFollowups);
router.post('/', controller.createFollowup);
router.get('/:id', controller.getFollowupById);
router.put('/:id', controller.updateFollowup);
router.delete('/:id', controller.deleteFollowup);
router.patch('/:id/assign', controller.assignFollowup);
router.patch('/:id/complete', controller.completeFollowup);
router.patch('/:id/close', controller.closeFollowup);
router.patch('/:id/reschedule', controller.rescheduleFollowup);

export default router;
