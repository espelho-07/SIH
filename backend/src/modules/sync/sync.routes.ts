import { Router } from 'express';
import { SyncController } from './sync.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SyncController();

router.use(authenticate);

router.get('/bootstrap', controller.bootstrap);
router.post('/push', controller.pushMutations);
router.get('/pull', controller.pullDelta);
router.post('/ack', controller.ackSync);
router.get('/status', controller.getSyncStatus);

router.post('/mutations', controller.pushMutations);
router.get('/conflicts', controller.getConflicts);
router.post('/conflicts/:id/resolve', controller.resolveConflict);

export default router;
