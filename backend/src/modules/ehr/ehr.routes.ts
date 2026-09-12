import { Router } from 'express';
import { EhrController } from './ehr.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new EhrController();

router.use(authenticate);

router.get('/patients/:patientId/timeline', controller.getTimeline);
router.get('/patients/:patientId/health-record', controller.getHealthRecord);
router.get('/patients/:patientId/fhir', controller.getFhirExport);

export default router;
