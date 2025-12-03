import { query } from '../config/database';
import { User } from '../types';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  async updateProfile(userId: number, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.firstName !== undefined) {
      updates.push('first_name = ?');
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push('last_name = ?');
      values.push(data.lastName);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update');
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const results: any = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }

  async getUserAddresses(userId: number): Promise<any[]> {
    const results: any = await query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return results;
  }

  async addUserAddress(userId: number, address: {
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }): Promise<any> {
    if (address.isDefault) {
      await query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    const result: any = await query(
      `INSERT INTO user_addresses
       (user_id, address_type, address_line1, address_line2, city, state, country, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address.addressType,
        address.addressLine1,
        address.addressLine2 || null,
        address.city,
        address.state || null,
        address.country,
        address.postalCode,
        address.isDefault || false
      ]
    );

    const addresses: any = await query(
      'SELECT * FROM user_addresses WHERE id = ?',
      [result.insertId]
    );

    return addresses[0];
  }

  async updateUserAddress(userId: number, addressId: number, updates: any): Promise<any> {
    const check: any = await query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (check.length === 0) {
      throw new AppError('Address not found', 404);
    }

    if (updates.isDefault) {
      await query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${snakeKey} = ?`);
      values.push(updates[key]);
    });

    values.push(addressId);

    await query(
      `UPDATE user_addresses SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const result: any = await query(
      'SELECT * FROM user_addresses WHERE id = ?',
      [addressId]
    );

    return result[0];
  }

  async deleteUserAddress(userId: number, addressId: number): Promise<void> {
    const check: any = await query(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (check.length === 0) {
      throw new AppError('Address not found', 404);
    }

    await query('DELETE FROM user_addresses WHERE id = ?', [addressId]);
  }

  async getAllUsers(page: number, limit: number, offset: number): Promise<{ users: User[]; total: number }> {
    const users: any = await query(
      'SELECT id, email, first_name, last_name, phone, role, avatar_url, is_verified, is_active, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const countResult: any = await query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    return { users, total };
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    const results: any = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }

  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);

    const results: any = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }
}

export const userService = new UserService();
