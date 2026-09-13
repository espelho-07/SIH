import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateParams } from '../../middleware/validation.middleware';
import { createHospitalSchema, updateHospitalSchema } from '../hospital/hospital.schema';
import { createDoctorSchema, updateDoctorSchema } from '../doctor/doctor.schema';
import { createMedicineSchema, updateMedicineSchema, updateStockSchema } from '../medicine/medicine.schema';
import { appointmentIdParamSchema, updateAppointmentStatusSchema } from '../appointment/appointment.schema';
import { z } from 'zod';

const router = Router();
const controller = new AdminController();

// Protect all admin endpoints
router.use(authenticate);
router.use(authorize('ADMIN', 'HOSPITAL_STAFF'));

// Appointment management
router.get('/appointments', controller.getAppointments);
router.get('/appointments/:appointmentId', validateParams(appointmentIdParamSchema), controller.getAppointmentById);
router.patch(
  '/appointments/:appointmentId/status',
  validateParams(appointmentIdParamSchema),
  validateBody(updateAppointmentStatusSchema),
  controller.updateAppointmentStatus
);

// Hospital management
router.post('/hospitals', validateBody(createHospitalSchema), controller.createHospital);
router.put('/hospitals/:id', validateBody(updateHospitalSchema), controller.updateHospital);
router.delete('/hospitals/:id', controller.deleteHospital);

// Doctor management
router.post('/doctors', validateBody(createDoctorSchema), controller.createDoctor);
router.put('/doctors/:id', validateBody(updateDoctorSchema), controller.updateDoctor);
router.delete('/doctors/:id', controller.deleteDoctor);

// Medicine catalog management
router.post('/medicines', validateBody(createMedicineSchema), controller.createMedicine);
router.put('/medicines/:id', validateBody(updateMedicineSchema), controller.updateMedicine);
router.delete('/medicines/:id', controller.deleteMedicine);

// Hospital services management
router.post(
  '/hospitals/:hospitalId/services',
  validateBody(
    z.object({
      serviceName: z.string().min(2),
      isAvailable: z.boolean().optional().default(true),
      description: z.string().optional(),
    })
  ),
  controller.addHospitalService
);
router.put(
  '/hospitals/:hospitalId/services/:serviceId',
  validateBody(
    z.object({
      serviceName: z.string().min(2).optional(),
      isAvailable: z.boolean().optional(),
      description: z.string().optional(),
    })
  ),
  controller.updateHospitalService
);

// Stock updates
router.put(
  '/hospitals/:hospitalId/medicines/:medicineId',
  validateBody(updateStockSchema),
  controller.updateMedicineStock
);

export default router;
