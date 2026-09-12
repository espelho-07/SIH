import { Router } from 'express';
import { DoctorController } from './doctor.controller';
import { AppointmentController } from '../appointment/appointment.controller';
import { validateQuery, validateParams, validateBody } from '../../middleware/validation.middleware';
import { doctorQuerySchema, doctorIdParamSchema, createDoctorSchema, updateDoctorSchema } from './doctor.schema';
import { getSlotsQuerySchema } from '../appointment/appointment.schema';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DoctorController();
const appointmentController = new AppointmentController();

router.get('/me', authenticate, controller.getDoctorMe);
router.put('/me', authenticate, controller.updateDoctorMe);
router.get('/available', validateQuery(doctorQuerySchema), controller.getAvailableDoctors);
router.get(
  '/:doctorId/slots',
  validateParams(doctorIdParamSchema),
  validateQuery(getSlotsQuerySchema),
  appointmentController.getDoctorSlots
);
router.get('/:id/availability', controller.getDoctorById);
router.put('/:id/availability', controller.updateAvailability);

router.get('/', validateQuery(doctorQuerySchema), controller.getAllDoctors);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'HOSPITAL_STAFF'),
  validateBody(createDoctorSchema),
  controller.createDoctor
);
router.get('/:doctorId', validateParams(doctorIdParamSchema), controller.getDoctorById);
router.put(
  '/:doctorId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'HOSPITAL_STAFF'),
  validateParams(doctorIdParamSchema),
  validateBody(updateDoctorSchema),
  controller.updateDoctor
);
router.delete(
  '/:doctorId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validateParams(doctorIdParamSchema),
  controller.deleteDoctor
);

export default router;
