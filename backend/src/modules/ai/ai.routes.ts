import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../middleware/validation.middleware';
import { symptomAnalysisSchema, aiHistoryQuerySchema } from './ai.schema';

const router = Router();
const controller = new AIController();

// Patient Chatbot Endpoint
router.post('/chat', authenticate, controller.patientChat);
router.post('/patient/chat', authenticate, controller.patientChat);

// Symptom assessment
router.post('/symptom-analysis', authenticate, validateBody(symptomAnalysisSchema), controller.analyzeSymptoms);
router.get('/history', authenticate, validateQuery(aiHistoryQuerySchema), controller.getHistory);

// Single Unified Dashboard
router.get('/dashboard', controller.getDashboard);

// AI Forecasting & Anomaly
router.post('/forecast/disease', controller.forecastDisease);
router.get('/forecast/disease', controller.forecastDisease);
router.get('/forecast/disease/:disease', controller.forecastDisease);

router.post('/forecast/specialist', controller.forecastSpecialist);
router.get('/forecast/specialist', controller.forecastSpecialist);

router.post('/forecast/patient-load', controller.forecastPatientLoad);
router.get('/forecast/patient-load', controller.forecastPatientLoad);

router.post('/forecast/beds', controller.forecastBeds);
router.get('/forecast/beds', controller.forecastBeds);

router.post('/forecast/ambulance', controller.forecastAmbulance);
router.get('/forecast/ambulance', controller.forecastAmbulance);

router.post('/forecast/blood', controller.forecastBlood);
router.get('/forecast/blood', controller.forecastBlood);

router.post('/anomaly/disease', controller.detectAnomaly);
router.get('/anomaly/disease', controller.detectAnomaly);
router.get('/anomaly/disease/:id', controller.detectAnomaly);

// Model Management
router.get('/models', controller.getModels);
router.get('/models/:id', controller.getModels);
router.post('/models', authenticate, authorize('SUPER_ADMIN'), controller.getModels);
router.post('/models/:id/train', authenticate, authorize('SUPER_ADMIN'), controller.trainModel);
router.patch('/models/:id/activate', authenticate, authorize('SUPER_ADMIN'), controller.activateModel);

// Outbreak Alert Acknowledgement
router.patch('/alerts/:alertId/acknowledge', controller.acknowledgeAlert);

export default router;
