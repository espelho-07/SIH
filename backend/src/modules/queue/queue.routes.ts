import { Router } from 'express';
import { QueueController } from './queue.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new QueueController();

router.get('/live', controller.getQueues);
router.get('/:id/live', controller.getLiveQueue);
router.get('/:id/position/:tokenId', controller.getPosition);

router.get('/', controller.getQueues);
router.get('/:id', controller.getQueueById);

router.post('/:id/next', optionalAuthenticate, controller.callNext);
router.post('/:id/call', optionalAuthenticate, controller.callNext);
router.post('/:id/skip', optionalAuthenticate, controller.skipToken);
router.post('/:id/no-show', optionalAuthenticate, controller.noShowToken);
router.post('/:id/recall', optionalAuthenticate, controller.recallToken);

export default router;
