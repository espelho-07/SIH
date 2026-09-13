import { Router } from 'express';
import { FacilityController } from './facility.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new FacilityController();

// Public Discovery, Search & Matching
router.get('/', controller.getAll);
router.get('/nearby', controller.getNearby);
router.get('/search', controller.search);
router.get('/nearest', controller.getNearestFacility);
router.post('/match', controller.matchFacilities);
router.get('/match/:matchId', controller.matchFacilities);

// Facility Bed Summary
router.get('/:facilityId/bed-summary', controller.getBedSummary);
router.patch('/:facilityId/bed-summary', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateBedStatus);

// Facility Detail & Capabilities
router.get('/:id', controller.getById);
router.get('/:id/capabilities', controller.getCapabilities);
router.put('/:id/capabilities', authenticate, authorize('ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'), controller.updateCapabilities);

// Management
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.createFacility);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.updateFacility);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteFacility);

export default router;
