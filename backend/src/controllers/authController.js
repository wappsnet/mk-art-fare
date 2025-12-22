import { authService } from '../services/authService.js';
import { emailService } from '../services/emailService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthController {
  async register(req, res) {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const user = await authService.createUser({
      email,
      password,
      firstName,
      lastName,
    });

    await emailService.sendWelcomeEmail(email, firstName);

    const payload = authService.createTokenPayload(user);
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);

    await authService.saveRefreshToken(user.id, refreshToken);

    const userResponse = { ...user };
    delete userResponse.password_hash;

    sendSuccess(
      res,
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      'Registration successful',
      201
    );
  }

  async login(req, res) {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.password_hash) {
      throw new AppError('Please login with Google', 401);
    }

    const isPasswordValid = await authService.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    const payload = authService.createTokenPayload(user);
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);

    await authService.saveRefreshToken(user.id, refreshToken);

    const userResponse = { ...user };
    delete userResponse.password_hash;

    sendSuccess(
      res,
      {
        user: userResponse,
        accessToken,
        refreshToken,
      },
      'Login successful'
    );
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const isValid = await authService.validateRefreshToken(refreshToken);
    if (!isValid) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const decoded = authService.verifyRefreshToken(refreshToken);

    const user = await authService.findUserById(decoded.userId);
    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    const payload = authService.createTokenPayload(user);
    const newAccessToken = authService.generateAccessToken(payload);
    const newRefreshToken = authService.generateRefreshToken(payload);

    await authService.deleteRefreshToken(refreshToken);
    await authService.saveRefreshToken(user.id, newRefreshToken);

    sendSuccess(
      res,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    );
  }

  async logout(req, res) {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.deleteRefreshToken(refreshToken);
    }

    if (req.user) {
      await authService.deleteUserRefreshTokens(req.user.userId);
    }

    sendSuccess(res, null, 'Logout successful');
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user) {
      sendSuccess(res, null, 'If the email exists, a reset link has been sent');
      return;
    }

    const resetToken = await authService.createPasswordResetToken(user.id);
    await emailService.sendPasswordResetEmail(email, resetToken);

    sendSuccess(res, null, 'If the email exists, a reset link has been sent');
  }

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    const userId = await authService.validatePasswordResetToken(token);
    if (!userId) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    await authService.updateUserPassword(userId, newPassword);
    await authService.markPasswordResetTokenAsUsed(token);
    await authService.deleteUserRefreshTokens(userId);

    sendSuccess(res, null, 'Password reset successful');
  }

  async getProfile(req, res) {
    const user = await authService.findUserById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userResponse = { ...user };
    delete userResponse.password_hash;

    sendSuccess(res, userResponse);
  }
}

export const authController = new AuthController();
