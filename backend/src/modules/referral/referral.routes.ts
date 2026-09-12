import { Router } from 'express';
import { ReferralController } from './referral.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ReferralController();

router.use(authenticate);

router.get('/incoming', controller.getIncomingReferrals);
router.get('/incoming/:id', controller.getIncomingReferrals);

router.post('/', controller.createReferral);
router.get('/', controller.getReferrals);
router.get('/:id', controller.getReferralById);
router.put('/:id', controller.updateReferral);
router.delete('/:id', controller.deleteReferral);

router.post('/:id/accept', controller.acceptReferral);
router.post('/:id/reject', controller.rejectReferral);
router.post('/:id/request-info', controller.requestInfo);
router.post('/:id/reroute', controller.reroute);
router.post('/:id/auto-reroute', controller.autoReroute);
router.post('/:id/confirm-arrival', controller.confirmArrival);
router.post('/:id/outcome', controller.recordOutcome);
router.post('/:id/close', controller.closeReferral);
router.get('/:id/events', controller.getEvents);

export default router;
