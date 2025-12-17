import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserService {
  async updateProfile(userId, data) {
    const updates = [];
    const values = [];

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

    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }

  async getUserAddresses(userId) {
    const results = await query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return results;
  }

  async addUserAddress(userId, address) {
    if (address.isDefault) {
      await query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const result = await query(
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
        address.isDefault || false,
      ]
    );

    const addresses = await query('SELECT * FROM user_addresses WHERE id = ?', [result.insertId]);

    return addresses[0];
  }

  async updateUserAddress(userId, addressId, updates) {
    const check = await query('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?', [
      addressId,
      userId,
    ]);

    if (check.length === 0) {
      throw new AppError('Address not found', 404);
    }

    if (updates.isDefault) {
      await query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const fields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      fields.push(`${snakeKey} = ?`);
      values.push(updates[key]);
    });

    values.push(addressId);

    await query(`UPDATE user_addresses SET ${fields.join(', ')} WHERE id = ?`, values);

    const result = await query('SELECT * FROM user_addresses WHERE id = ?', [addressId]);

    return result[0];
  }

  async deleteUserAddress(userId, addressId) {
    const check = await query('SELECT * FROM user_addresses WHERE id = ? AND user_id = ?', [
      addressId,
      userId,
    ]);

    if (check.length === 0) {
      throw new AppError('Address not found', 404);
    }

    await query('DELETE FROM user_addresses WHERE id = ?', [addressId]);
  }

  async getAllUsers(page, limit, offset) {
    // Ensure limit and offset are valid integers (safe for string interpolation)
    const validLimit = Number.parseInt(limit, 10) || 10;
    const validOffset = Number.parseInt(offset, 10) || 0;

    const users = await query(
      `SELECT id, email, first_name, last_name, phone, role, avatar_url, is_verified, is_active, created_at FROM users LIMIT ${validLimit} OFFSET ${validOffset}`
    );

    const countResult = await query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    return { users, total };
  }

  async updateUserRole(userId, role) {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }

  async toggleUserStatus(userId, isActive) {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);

    const results = await query('SELECT * FROM users WHERE id = ?', [userId]);
    return results[0];
  }
}

export const userService = new UserService();
