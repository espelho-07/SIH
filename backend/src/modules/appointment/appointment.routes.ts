import { Router } from 'express';
import { AppointmentController } from './appointment.controller';
import { optionalAuthenticate, authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AppointmentController();

// Patient & Authenticated Endpoints
router.get('/', optionalAuthenticate, controller.getMyAppointments);
router.post('/', optionalAuthenticate, controller.bookAppointment);
router.get('/my', optionalAuthenticate, controller.getMyAppointments);
router.post('/:appointmentId/check-in', optionalAuthenticate, controller.checkInAppointment);
router.get('/:appointmentId', optionalAuthenticate, controller.getAppointmentDetails);
router.patch('/:appointmentId/cancel', optionalAuthenticate, controller.cancelAppointment);

// Doctor slots
router.get('/slots/doctor/:doctorId', controller.getDoctorSlots);

export default router;
