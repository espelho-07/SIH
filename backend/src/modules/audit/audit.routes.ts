import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AuditController();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN', 'DISTRICT_ADMIN'));

router.get('/patient/:patientId', controller.getLogsByPatient);
router.get('/user/:userId', controller.getLogsByUser);
router.get('/facility/:facilityId', controller.getLogsByFacility);
router.get('/', controller.getAuditLogs);
router.get('/:id', controller.getAuditLogById);

export default router;
