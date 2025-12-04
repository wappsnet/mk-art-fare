import { userService } from '../services/userService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPaginationParams } from '../utils/helpers.js';

export class UserController {
  async updateProfile(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { firstName, lastName, phone, avatarUrl } = req.body;

      const user = await userService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone,
        avatarUrl,
      });

      const userResponse = { ...user };
      delete userResponse.password_hash;

      sendSuccess(res, userResponse, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAddresses(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const addresses = await userService.getUserAddresses(req.user.userId);
      sendSuccess(res, addresses);
    } catch (error) {
      next(error);
    }
  }

  async addAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const address = await userService.addUserAddress(req.user.userId, req.body);
      sendSuccess(res, address, 'Address added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const addressId = parseInt(req.params.id);
      const address = await userService.updateUserAddress(req.user.userId, addressId, req.body);

      sendSuccess(res, address, 'Address updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const addressId = parseInt(req.params.id);
      await userService.deleteUserAddress(req.user.userId, addressId);

      sendSuccess(res, null, 'Address deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

      const { users, total } = await userService.getAllUsers(page, limit, offset);

      const usersResponse = users.map((user) => {
        const u = { ...user };
        delete u.password_hash;
        return u;
      });

      sendPaginated(res, usersResponse, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      const user = await userService.updateUserRole(userId, role);

      const userResponse = { ...user };
      delete userResponse.password_hash;

      sendSuccess(res, userResponse, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;

      const user = await userService.toggleUserStatus(userId, isActive);

      const userResponse = { ...user };
      delete userResponse.password_hash;

      sendSuccess(res, userResponse, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
