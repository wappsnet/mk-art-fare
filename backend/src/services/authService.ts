import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { query } from '../config/database';
import { User, JWTPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry
    });
  }

  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry
    });
  }

  verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const results: any = await query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return results.length > 0;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  async createPasswordResetToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );

    return token;
  }

  async validatePasswordResetToken(token: string): Promise<number | null> {
    const results: any = await query(
      'SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW() AND used = FALSE',
      [token]
    );

    if (results.length === 0) {
      return null;
    }

    return results[0].user_id;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await query('UPDATE password_resets SET used = TRUE WHERE token = ?', [token]);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const results: any = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return results.length > 0 ? results[0] : null;
  }

  async findUserById(id: number): Promise<User | null> {
    const results: any = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return results.length > 0 ? results[0] : null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const results: any = await query(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    return results.length > 0 ? results[0] : null;
  }

  async createUser(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    googleId?: string;
  }): Promise<User> {
    const passwordHash = data.password ? await this.hashPassword(data.password) : null;

    const result: any = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, google_id, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        passwordHash,
        data.firstName || null,
        data.lastName || null,
        data.googleId || null,
        data.googleId ? true : false
      ]
    );

    const user = await this.findUserById(result.insertId);
    if (!user) {
      throw new AppError('Failed to create user');
    }

    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  }

  createTokenPayload(user: User): JWTPayload {
    return {
      userId: user.id,
      email: user.email,
      role: user.role
    };
  }
}

export const authService = new AuthService();
