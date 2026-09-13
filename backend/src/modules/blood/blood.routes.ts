import { Router } from 'express';
import { BloodController } from './blood.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateQuery, validateParams, validateBody } from '../../middleware/validation.middleware';
import {
  emergencyBloodQuerySchema,
  createBloodInventorySchema,
  updateBloodInventorySchema,
  hospitalBloodParamSchema,
} from './blood.schema';

const router = Router();
const controller = new BloodController();

// Emergency Blood Search (Public / Patient)
router.get('/blood', validateQuery(emergencyBloodQuerySchema), controller.findEmergencyBlood);
router.get('/inventory', controller.getAllInventory);

// Hospital Blood Inventory Management (Hospital Staff / Admin)
router.get(
  '/hospitals/:hospitalId/blood-inventory',
  validateParams(hospitalBloodParamSchema),
  controller.getHospitalInventory
);

router.post(
  '/hospitals/:hospitalId/blood-inventory',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(hospitalBloodParamSchema),
  validateBody(createBloodInventorySchema),
  controller.createOrUpdateBloodInventory
);

router.patch(
  '/hospitals/:hospitalId/blood-inventory/:bloodGroup',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(hospitalBloodParamSchema),
  validateBody(updateBloodInventorySchema),
  controller.updateBloodGroup
);

router.delete(
  '/hospitals/:hospitalId/blood-inventory/:bloodGroup',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(hospitalBloodParamSchema),
  controller.deleteBloodGroup
);

export default router;
