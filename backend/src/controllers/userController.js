import { userService } from '../services/userService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { getPaginationParams } from '../utils/helpers.js';

export class UserController {
  async updateProfile(req, res) {
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
  }

  async getAddresses(req, res) {
    const addresses = await userService.getUserAddresses(req.user.userId);
    sendSuccess(res, addresses);
  }

  async addAddress(req, res) {
    const address = await userService.addUserAddress(req.user.userId, req.body);
    sendSuccess(res, address, 'Address added successfully', 201);
  }

  async updateAddress(req, res) {
    const addressId = Number.parseInt(req.params.id);
    const address = await userService.updateUserAddress(req.user.userId, addressId, req.body);

    sendSuccess(res, address, 'Address updated successfully');
  }

  async deleteAddress(req, res) {
    const addressId = Number.parseInt(req.params.id);
    await userService.deleteUserAddress(req.user.userId, addressId);

    sendSuccess(res, null, 'Address deleted successfully');
  }

  async getAllUsers(req, res) {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    const { users, total } = await userService.getAllUsers(page, limit, offset);

    const usersResponse = users.map((user) => {
      const u = { ...user };
      delete u.password_hash;
      return u;
    });

    sendPaginated(res, usersResponse, page, limit, total);
  }

  async updateUserRole(req, res) {
    const userId = Number.parseInt(req.params.id);
    const { role } = req.body;

    const user = await userService.updateUserRole(userId, role);

    const userResponse = { ...user };
    delete userResponse.password_hash;

    sendSuccess(res, userResponse, 'User role updated successfully');
  }

  async toggleUserStatus(req, res) {
    const userId = Number.parseInt(req.params.id);
    const { isActive } = req.body;

    const user = await userService.toggleUserStatus(userId, isActive);

    const userResponse = { ...user };
    delete userResponse.password_hash;

    sendSuccess(res, userResponse, 'User status updated successfully');
  }
}

export const userController = new UserController();
