import express from 'express';

const router = express.Router();
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
