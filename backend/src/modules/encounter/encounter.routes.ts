import { Router } from 'express';
import { EncounterController } from './encounter.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new EncounterController();

router.use(authenticate);

router.post('/', authorize('DOCTOR', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.createEncounter);
router.get('/', controller.getAllEncounters);
router.get('/:id', controller.getEncounterById);
router.put('/:id', authorize('DOCTOR', 'SUPER_ADMIN'), controller.updateEncounter);
router.delete('/:id', authorize('DOCTOR', 'SUPER_ADMIN'), controller.deleteEncounter);
router.patch('/:id/complete', authorize('DOCTOR', 'SUPER_ADMIN'), controller.completeEncounter);

router.post('/:encounterId/vitals', authorize('DOCTOR', 'FACILITY_STAFF', 'ASHA'), controller.addVitals);
router.post('/:encounterId/diagnoses', authorize('DOCTOR', 'SUPER_ADMIN'), controller.addDiagnosis);
router.post('/:encounterId/prescriptions', authorize('DOCTOR', 'SUPER_ADMIN'), controller.addPrescription);

export default router;
