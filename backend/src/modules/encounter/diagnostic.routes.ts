import { Router } from 'express';
import { DiagnosticController } from './diagnostic.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DiagnosticController();

router.use(optionalAuthenticate);

router.get('/orders', controller.getOrders);
router.get('/orders/:orderId', controller.getOrderById);

router.patch('/orders/:orderId/collect', controller.collectSample);
router.post('/orders/:orderId/collect', controller.collectSample);

router.patch('/orders/:orderId/receive', controller.receiveSample);
router.post('/orders/:orderId/receive', controller.receiveSample);

router.patch('/orders/:orderId/reject', controller.rejectSample);
router.post('/orders/:orderId/reject', controller.rejectSample);

router.patch('/orders/:orderId/process', controller.startProcessing);
router.post('/orders/:orderId/process', controller.startProcessing);

router.patch('/orders/:orderId/result', controller.submitResult);
router.post('/orders/:orderId/result', controller.submitResult);

export default router;
