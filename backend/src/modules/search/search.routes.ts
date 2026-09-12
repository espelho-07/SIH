import { Router } from 'express';
import { SearchController } from './search.controller';

const router = Router();
const controller = new SearchController();

router.get('/facilities', controller.searchFacilities);
router.get('/doctors', controller.searchDoctors);
router.get('/equipment', controller.searchEquipment);
router.get('/specialties', controller.unifiedSearch);
router.get('/', controller.unifiedSearch);

export default router;
