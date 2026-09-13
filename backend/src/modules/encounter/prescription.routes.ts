import { Router } from 'express';
import { PharmacyController } from '../pharmacy/pharmacy.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PharmacyController();

router.use(optionalAuthenticate);

router.get('/', controller.getPrescriptions);
router.get('/history', controller.getDispensingHistory);
router.get('/:prescriptionId', controller.getPrescriptionById);
router.patch('/:prescriptionId/dispense', controller.dispensePrescription);
router.post('/:prescriptionId/dispense', controller.dispensePrescription);

export default router;
