import { Router } from 'express';
import { BedController } from './bed.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new BedController();

router.get('/', controller.getBeds);
router.get('/facilities/:facilityId/beds', controller.getBeds);
router.get('/facilities/:facilityId/bed-summary', controller.getBedSummary);
router.get('/:id', controller.getBedById);

router.post('/', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.createBed);
router.put('/:id', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateBed);
router.delete('/:id', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.deleteBed);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateStatus);

export default router;
