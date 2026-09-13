import { Router } from 'express';
import { AshaController } from './asha.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AshaController();

router.use(optionalAuthenticate);

// Dashboard & Profile
router.get('/dashboard', controller.getDashboard);
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

// Patients
router.get('/patients', controller.getPatients);
router.get('/patients/:patientId', controller.getPatientById);
router.post('/patients', controller.createPatient);
router.put('/patients/:patientId', controller.updatePatient);

// Visits
router.get('/visits', controller.getVisits);
router.post('/visits', controller.createVisit);
router.put('/visits', controller.updateVisit);
router.patch('/visits', controller.updateVisit);
router.put('/visits/:visitId', controller.updateVisit);
router.patch('/visits/:visitId', controller.updateVisit);

// Tasks / Follow-ups
router.get('/tasks', controller.getTasks);
router.patch('/tasks', controller.updateTask);
router.put('/tasks', controller.updateTask);
router.get('/follow-ups', controller.getTasks);
router.patch('/follow-ups', controller.updateTask);
router.put('/follow-ups', controller.updateTask);
router.patch('/followups/:id/start', controller.updateTask);
router.patch('/followups/:id/complete', controller.updateTask);
router.patch('/followups/:id/reschedule', controller.updateTask);

// Referrals
router.get('/referrals', controller.getReferrals);
router.post('/referrals', controller.createReferral);

// Screenings
router.post('/screenings', controller.createScreening);

export default router;
