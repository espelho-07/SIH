import { Router } from 'express';
import { HospitalController } from './hospital.controller';
import { BloodController } from '../blood/blood.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateQuery, validateParams, validateBody } from '../../middleware/validation.middleware';
import {
  hospitalQuerySchema,
  nearbyHospitalQuerySchema,
  nearbyTreatmentQuerySchema,
  treatmentCostQuerySchema,
  hospitalIdParamSchema,
  createHospitalSchema,
  updateHospitalSchema,
} from './hospital.schema';
import {
  createBloodInventorySchema,
  updateBloodInventorySchema,
  hospitalBloodParamSchema,
} from '../blood/blood.schema';

const router = Router();
const controller = new HospitalController();
const bloodController = new BloodController();

// Treatment & Cost Features
router.get('/nearby/treatment', validateQuery(nearbyTreatmentQuerySchema), controller.getNearbyHospitalsByTreatment);
router.get('/treatment-cost', validateQuery(treatmentCostQuerySchema), controller.getTreatmentCosts);
router.get('/nearby', validateQuery(nearbyHospitalQuerySchema), controller.getNearbyHospitals);
router.get('/', validateQuery(hospitalQuerySchema), controller.getAllHospitals);

// Hospital Management (CRUD - Admin / District Admin / Super Admin)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN'),
  validateBody(createHospitalSchema),
  controller.createHospital
);
router.put(
  '/:hospitalId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN'),
  validateParams(hospitalIdParamSchema),
  validateBody(updateHospitalSchema),
  controller.updateHospital
);
router.delete(
  '/:hospitalId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'DISTRICT_ADMIN'),
  validateParams(hospitalIdParamSchema),
  controller.deleteHospital
);

// Hospital Details & Sub-resources
router.get('/:hospitalId', validateParams(hospitalIdParamSchema), controller.getHospitalById);
router.get('/:hospitalId/details', validateParams(hospitalIdParamSchema), controller.getHospitalDetails);
router.get('/:hospitalId/doctors', validateParams(hospitalIdParamSchema), controller.getHospitalDoctors);
router.get('/:hospitalId/medicines', validateParams(hospitalIdParamSchema), controller.getHospitalMedicines);
router.get('/:hospitalId/services', validateParams(hospitalIdParamSchema), controller.getHospitalServices);

// Hospital Blood Inventory Management (Staff / Admin & Public GET)
router.get('/:hospitalId/blood-inventory', validateParams(hospitalBloodParamSchema), bloodController.getHospitalInventory);
router.post(
  '/:hospitalId/blood-inventory',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(hospitalBloodParamSchema),
  validateBody(createBloodInventorySchema),
  bloodController.createOrUpdateBloodInventory
);
router.patch(
  '/:hospitalId/blood-inventory/:bloodGroup',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(hospitalBloodParamSchema),
  validateBody(updateBloodInventorySchema),
  bloodController.updateBloodGroup
);

export default router;
