import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validation.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

// Public Auth
router.post('/register', authLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authLimiter, validateBody(loginSchema), controller.login);
router.post('/refresh', authLimiter, validateBody(refreshTokenSchema), controller.refresh);
router.post('/logout', controller.logout);

// Patient Mobile OTP
router.post('/patient/send-otp', controller.sendOtp);
router.post('/patient/verify-otp', controller.verifyOtp);

// Password recovery
router.post('/forgot-password', controller.sendOtp);
router.post('/reset-password', controller.verifyOtp);

// Authenticated User Profile
router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);
router.put('/me/password', authenticate, controller.changePassword);

// ABHA Sandbox Support
router.post('/abha/generate', controller.generateAbha);
router.post('/abha/link', authenticate, controller.linkAbha);
router.get('/abha', authenticate, controller.getProfile);

export default router;
