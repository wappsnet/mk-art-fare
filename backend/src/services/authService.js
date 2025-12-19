import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { subscriptionService } from './subscriptionService.js';

export class AuthService {
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  generateAccessToken(payload) {
    // @ts-ignore
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  generateRefreshToken(payload) {
    // @ts-ignore
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
  }

  async saveRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
      userId,
      token,
      expiresAt,
    ]);
  }

  async validateRefreshToken(token) {
    const results = await query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return results.length > 0;
  }

  async deleteRefreshToken(token) {
    await query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }

  async deleteUserRefreshTokens(userId) {
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  async createPasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)', [
      userId,
      token,
      expiresAt,
    ]);

    return token;
  }

  async validatePasswordResetToken(token) {
    const results = await query(
      'SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW() AND used = FALSE',
      [token]
    );

    if (results.length === 0) {
      return null;
    }

    return results[0].user_id;
  }

  async markPasswordResetTokenAsUsed(token) {
    await query('UPDATE password_resets SET used = TRUE WHERE token = ?', [token]);
  }

  async findUserByEmail(email) {
    const results = await query('SELECT * FROM users WHERE email = ?', [email]);

    return results.length > 0 ? results[0] : null;
  }

  async findUserById(id) {
    const results = await query('SELECT * FROM users WHERE id = ?', [id]);

    return results.length > 0 ? results[0] : null;
  }

  async findUserByGoogleId(googleId) {
    const results = await query('SELECT * FROM users WHERE google_id = ?', [googleId]);

    return results.length > 0 ? results[0] : null;
  }

  async createUser(data) {
    const passwordHash = data.password ? await this.hashPassword(data.password) : null;

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, google_id, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        passwordHash,
        data.firstName || null,
        data.lastName || null,
        data.googleId || null,
        data.googleId ? true : false,
      ]
    );

    const user = await this.findUserById(result.insertId);
    if (!user) {
      throw new AppError('Failed to create user');
    }

    // Create default Basic subscription for new user
    await subscriptionService.createDefaultSubscription(user.id);

    return user;
  }

  async updateUserPassword(userId, newPassword) {
    const passwordHash = await this.hashPassword(newPassword);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
  }

  createTokenPayload(user) {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
