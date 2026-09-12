import { Router } from 'express';
import { EquipmentController } from './equipment.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new EquipmentController();

router.get('/facilities/:facilityId/equipment', controller.getEquipment);
router.post('/facilities/:facilityId/equipment', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.createEquipment);
router.put('/:id/status', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateStatus);

router.get('/', controller.getEquipment);
router.get('/:id', controller.getEquipmentById);
router.post('/', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.createEquipment);
router.put('/:id', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateEquipment);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteEquipment);

export default router;
