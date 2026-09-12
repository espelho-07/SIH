import { Router } from 'express';
import { MedicineController } from './medicine.controller';
import { validateQuery, validateParams } from '../../middleware/validation.middleware';
import { medicineQuerySchema, medicineIdParamSchema, medicineAvailabilityQuerySchema } from './medicine.schema';

import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new MedicineController();

router.get('/', validateQuery(medicineQuerySchema), controller.getAllMedicines);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HOSPITAL_STAFF'), controller.createMedicine);
router.get('/:medicineId', validateParams(medicineIdParamSchema), controller.getMedicineById);
router.put('/:medicineId', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'HOSPITAL_STAFF'), controller.updateMedicine);
router.delete('/:medicineId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteMedicine);
router.patch('/:medicineId/quarantine', controller.quarantineBatch);
router.patch('/:medicineId/stock', controller.adjustStock);
router.get(
  '/:medicineId/availability',
  validateParams(medicineIdParamSchema),
  validateQuery(medicineAvailabilityQuerySchema),
  controller.getMedicineAvailability
);

export default router;
