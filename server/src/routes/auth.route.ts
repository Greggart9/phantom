import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateMe,
  requestPasswordChange,
  confirmPasswordChange,
  forgotPassword,
  resetPassword,
  sendMagicLink,
  verifyMagicLink,
  googleAuth
} from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Magic Link routes
router.post('/magic-link', sendMagicLink);
router.post('/verify-magic-link', verifyMagicLink);

// Google OAuth route
router.post('/google', googleAuth);

// Protected routes (requires valid session/token)
router.get('/me', requireAuth, getMe);
router.put('/me', requireAuth, updateMe);
router.post('/request-password-change', requireAuth, requestPasswordChange);
router.post('/confirm-password-change', requireAuth, confirmPasswordChange);

export default router;