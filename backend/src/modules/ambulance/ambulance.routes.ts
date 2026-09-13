import { Router } from 'express';
import { AmbulanceController } from './ambulance.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AmbulanceController();

router.post('/request', controller.createRequest);
router.get('/requests', controller.getRequests);
router.get('/requests/:id', controller.getRequestById);
router.patch('/requests/:id/assign', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.assignRequest);
router.patch('/requests/:id/accept', controller.updateRequestStatus);
router.patch('/requests/:id/start', controller.updateRequestStatus);
router.patch('/requests/:id/complete', controller.updateRequestStatus);

router.post('/:id/location', controller.updateLocation);
router.get('/:id/location', controller.getLocation);

router.get('/', controller.getAmbulances);
router.get('/:id', controller.getAmbulanceById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.createAmbulance);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.updateAmbulance);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteAmbulance);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateStatus);

export default router;
