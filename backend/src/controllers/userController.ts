import { Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/helpers';

export class UserController {
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const { firstName, lastName, phone, avatarUrl } = req.body;

      const user = await userService.updateProfile(req.user.userId, {
        firstName,
        lastName,
        phone,
        avatarUrl
      });

      const userResponse = { ...user };
      delete userResponse.password_hash;

      sendSuccess(res, userResponse, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAddresses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async addAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = getPaginationParams(req.query.page as string, req.query.limit as string);

      const { users, total } = await userService.getAllUsers(page, limit, offset);

      const usersResponse = users.map((user: any) => {
        const u = { ...user };
        delete u.password_hash;
        return u;
      });

      sendPaginated(res, usersResponse, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
