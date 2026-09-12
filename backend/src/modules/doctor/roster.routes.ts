import { Router } from 'express';
import { DoctorController } from './doctor.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DoctorController();

router.get('/', controller.getRosters);
router.get('/:id', controller.getRosterById);
router.post('/', authenticate, authorize('ADMIN', 'HOSPITAL_STAFF', 'SUPER_ADMIN'), controller.createRoster);
router.put('/:id', authenticate, authorize('ADMIN', 'HOSPITAL_STAFF', 'SUPER_ADMIN'), controller.updateRoster);
router.delete('/:id', authenticate, authorize('ADMIN', 'HOSPITAL_STAFF', 'SUPER_ADMIN'), controller.deleteRoster);

export default router;
