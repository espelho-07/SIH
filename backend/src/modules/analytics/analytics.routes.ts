import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

router.get('/facility/:facilityId', controller.getFacilityAnalytics);
router.get('/facility/:facilityId/patients', controller.getFacilityAnalytics);
router.get('/facility/:facilityId/queue', controller.getFacilityAnalytics);
router.get('/facility/:facilityId/referrals', controller.getFacilityAnalytics);

router.get('/disease-trends', controller.getDiseaseTrends);
router.get('/outbreak-alerts', controller.getOutbreakAlerts);

router.get('/heatmap', controller.getEpidemicHeatmap);
router.get('/clusters', controller.getEpidemicHeatmap);

export default router;
