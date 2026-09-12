import { Router } from 'express';
import { TokenController } from './token.controller';
import { optionalAuthenticate, authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new TokenController();

// Patient Token Endpoints
router.post('/', optionalAuthenticate, controller.requestToken);
router.get('/', optionalAuthenticate, controller.getAllTokens);
router.get('/my', optionalAuthenticate, controller.getMyTokens);
router.get('/:tokenId', optionalAuthenticate, controller.getTokenById);
router.patch('/:tokenId/cancel', optionalAuthenticate, controller.cancelToken);
router.delete('/:tokenId', optionalAuthenticate, controller.deleteToken);

// Queue Information (Public / Staff)
router.get('/hospitals/:hospitalId/doctors/:doctorId/queue', controller.getDoctorQueue);

// Staff / Admin Queue Control
router.patch('/:tokenId/status', optionalAuthenticate, controller.updateTokenStatus);
router.patch('/hospitals/:hospitalId/doctors/:doctorId/queue/next', optionalAuthenticate, controller.callNextPatient);

export default router;
