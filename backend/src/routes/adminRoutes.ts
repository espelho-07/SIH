import { Router } from 'express';
import {
  getSystemHealth,
  getAdminUsers,
  createAdminUser,
  getPermissionMatrix,
  getAiModels,
  deployAiModel,
  rollbackAiModel,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// System Health (open to health checks)
router.get('/super-admin/system-health', getSystemHealth);
router.get('/health', getSystemHealth);

// Admin entities (protected)
router.get('/super-admin/users', authenticate, authorize(['SUPER_ADMIN', 'DISTRICT_ADMIN']), getAdminUsers);
router.post('/super-admin/users', authenticate, authorize(['SUPER_ADMIN']), createAdminUser);
router.get('/super-admin/roles', authenticate, authorize(['SUPER_ADMIN']), getPermissionMatrix);
router.get('/super-admin/ai-models', authenticate, authorize(['SUPER_ADMIN']), getAiModels);
router.post('/super-admin/ai-models/:modelId/deploy', authenticate, authorize(['SUPER_ADMIN']), deployAiModel);
router.post('/super-admin/ai-models/:modelId/rollback', authenticate, authorize(['SUPER_ADMIN']), rollbackAiModel);
router.get('/super-admin/audit', authenticate, authorize(['SUPER_ADMIN', 'DISTRICT_ADMIN']), getAuditLogs);

export default router;
