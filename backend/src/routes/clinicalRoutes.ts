import { Router } from 'express';
import {
  getPatientHealthRecord,
  getTimeline,
  createEncounter,
  saveVitals,
} from '../controllers/clinicalController';
import {
  getPrescriptions,
  getPrescriptionById,
  dispensePrescription,
} from '../controllers/pharmacyController';
import { authenticate } from '../middleware/auth';

const router = Router();

// EHR & Encounters
router.get('/patients/:patientId/health-record', getPatientHealthRecord);
router.get('/patients/:patientId/timeline', getTimeline);
router.post('/encounters', authenticate, createEncounter);
router.post('/encounters/:encounterId/vitals', authenticate, saveVitals);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:prescriptionId', getPrescriptionById);
router.patch('/prescriptions/:prescriptionId/dispense', authenticate, dispensePrescription);

export default router;
