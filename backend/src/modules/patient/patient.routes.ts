import { Router } from 'express';
import { PatientController } from './patient.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PatientController();

router.use(authenticate);

router.get('/me', controller.getMyProfile);
router.put('/me', controller.updateMyProfile);
router.get('/me/referrals', controller.getMyReferrals);
router.get('/referrals', controller.getMyReferrals);
router.get('/search', controller.searchPatients);
router.get('/', controller.getAllPatients);
router.post('/', controller.registerPatient);
router.get('/:patientId', controller.getPatientById);
router.put('/:patientId', controller.updatePatientById);
router.delete('/:patientId', controller.deletePatientById);

export default router;
