import { Router } from 'express';
import { ConsentController } from './consent.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ConsentController();

router.use(authenticate);

router.post('/', controller.createConsent);
router.get('/', controller.getConsents);
router.get('/:id', controller.getConsentById);
router.put('/:id', controller.updateConsent);
router.delete('/:id', controller.deleteConsent);
router.post('/:id/grant', controller.grantConsent);
router.post('/:id/revoke', controller.revokeConsent);

router.post('/patients/:patientId/break-glass', controller.triggerBreakGlass);
router.get('/break-glass/:id', controller.getBreakGlassLog);
router.get('/patients/:patientId/access-history', controller.getAccessHistory);

export default router;
