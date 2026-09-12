import { Router } from 'express';
import {
  searchClerkPatients,
  getClerkPatientById,
  checkDuplicatePatient,
  registerPatient,
  getAppointments,
  bookAppointment,
  assignDoctorToAppointment,
  updateAppointment,
  checkInAppointment,
  cancelAppointment,
  getLiveQueue,
  callNext,
  skipToken,
  noShowToken,
  generateToken,
  getTokenById,
  cancelToken,
} from '../controllers/queueController';

const router = Router();

// Clerk Patients
router.get('/clerk/patients', searchClerkPatients);
router.post('/clerk/patients/check-duplicate', checkDuplicatePatient);
router.post('/clerk/patients/register', registerPatient);
router.get('/clerk/patients/:id', getClerkPatientById);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);
router.patch('/appointments/:appointmentId/assign-doctor', assignDoctorToAppointment);
router.patch('/appointments/:appointmentId/check-in', checkInAppointment);
router.post('/appointments/:appointmentId/check-in', checkInAppointment);
router.patch('/appointments/:appointmentId/cancel', cancelAppointment);
router.patch('/appointments/:appointmentId', updateAppointment);

// Live Queues
router.get('/queues/:facilityId/live', getLiveQueue);
router.post('/queues/:facilityId/next', callNext);
router.post('/queues/:queueId/skip', skipToken);
router.post('/queues/:queueId/no-show', noShowToken);

// Tokens
router.post('/tokens', generateToken);
router.get('/tokens/:tokenId', getTokenById);
router.patch('/tokens/:tokenId/cancel', cancelToken);

export default router;
