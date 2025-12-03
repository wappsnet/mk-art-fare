import { Router } from 'express';
import passport from '../config/passport';
import { authController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from './validators/authValidators';

const router = Router();

router.post(
  '/register',
  validate(registerValidator),
  asyncHandler(authController.register.bind(authController))
);

router.post(
  '/login',
  validate(loginValidator),
  asyncHandler(authController.login.bind(authController))
);

router.post(
  '/refresh-token',
  validate(refreshTokenValidator),
  asyncHandler(authController.refreshToken.bind(authController))
);

router.post(
  '/logout',
  asyncHandler(authController.logout.bind(authController))
);

router.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  asyncHandler(authController.forgotPassword.bind(authController))
);

router.post(
  '/reset-password',
  validate(resetPasswordValidator),
  asyncHandler(authController.resetPassword.bind(authController))
);

router.get(
  '/profile',
  authenticate,
  asyncHandler(authController.getProfile.bind(authController))
);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  asyncHandler(async (req, res) => {
    const user = req.user as any;

    const payload = authService.createTokenPayload(user);
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);

    await authService.saveRefreshToken(user.id, refreshToken);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  })
);

export default router;
