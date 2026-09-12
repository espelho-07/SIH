import { Router } from 'express';
import { TeleconsultationController } from './teleconsultation.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../../middleware/validation.middleware';
import {
  createTeleconsultationSchema,
  teleconsultationQuerySchema,
  consultationIdParamSchema,
  sendMessageSchema,
} from './teleconsultation.schema';

const router = Router();
const controller = new TeleconsultationController();

// Patient & Staff Endpoints
router.post('/', authenticate, validateBody(createTeleconsultationSchema), controller.requestTeleconsultation);
router.get('/', authenticate, authorize('ADMIN', 'HOSPITAL_STAFF', 'SUPER_ADMIN'), controller.getAllConsultations);
router.get('/my', authenticate, validateQuery(teleconsultationQuerySchema), controller.getMyConsultations);
router.get('/:consultationId', authenticate, validateParams(consultationIdParamSchema), controller.getConsultationDetails);
router.put('/:consultationId', authenticate, authorize('ADMIN', 'HOSPITAL_STAFF', 'SUPER_ADMIN'), controller.updateConsultation);
router.delete('/:consultationId', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteConsultation);

// Doctor / Staff Endpoints
router.patch(
  '/:consultationId/accept',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(consultationIdParamSchema),
  controller.acceptConsultation
);

router.patch(
  '/:consultationId/reject',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(consultationIdParamSchema),
  controller.rejectConsultation
);

router.patch(
  '/:consultationId/start',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(consultationIdParamSchema),
  controller.startConsultation
);

router.patch(
  '/:consultationId/end',
  authenticate,
  authorize('ADMIN', 'HOSPITAL_STAFF'),
  validateParams(consultationIdParamSchema),
  controller.endConsultation
);

// Real-time Chat / HTTP fallback Message Sending
router.post(
  '/:consultationId/messages',
  authenticate,
  validateParams(consultationIdParamSchema),
  validateBody(sendMessageSchema),
  controller.sendMessage
);

export default router;
