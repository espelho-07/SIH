import { Router } from 'express';
import { SuperAdminController } from './superadmin.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SuperAdminController();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

router.get('/dashboard', controller.getDashboard);
router.get('/system-health', controller.getSystemHealth);
router.get('/users', controller.getUsers);
router.get('/roles', controller.getRoles);
router.get('/ai-models', controller.getAiModels);
router.post('/ai-models/:id/deploy', controller.deployModel);
router.post('/ai-models/:modelId/deploy', controller.deployModel);
router.post('/ai-models/:id/rollback', controller.rollbackModel);
router.post('/ai-models/:modelId/rollback', controller.rollbackModel);
router.post('/ai/models/:id/deploy', controller.deployModel);
router.post('/ai/models/:id/rollback', controller.rollbackModel);
router.get('/audit', controller.getAuditLogs);
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

export default router;
