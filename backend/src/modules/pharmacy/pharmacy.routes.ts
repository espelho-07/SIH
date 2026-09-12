import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PharmacyController();

router.use(optionalAuthenticate);

router.get('/history', controller.getDispensingHistory);
router.post('/dispense', controller.dispensePrescription);

export default router;
