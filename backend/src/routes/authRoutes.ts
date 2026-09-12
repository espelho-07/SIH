import { Router } from 'express';
import {
  sendPatientOtp,
  verifyPatientOtp,
  login,
  getCurrentUser,
  refresh,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/patient/send-otp', sendPatientOtp);
router.post('/patient/verify-otp', verifyPatientOtp);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
