import { Router } from 'express';
import { ClerkController } from './clerk.controller';

const router = Router();
const controller = new ClerkController();

router.get('/patients', controller.searchPatients);
router.get('/patients/:id', controller.getPatientById);
router.post('/patients/check-duplicate', controller.checkDuplicate);
router.post('/patients/register', controller.registerPatient);

export default router;
