import { categoryService } from '../services/categoryService.js';

export class CategoryController {
  // Get all global categories
  async getGlobalCategories(req, res) {
    const categories = await categoryService.getGlobalCategories();
    res.json({
      success: true,
      data: categories,
    });
  }

  // Get categories for a specific organization
  async getOrganizationCategories(req, res) {
    const organizationId = Number.parseInt(req.params.organizationId);
    const categories = await categoryService.getCategoriesForOrganization(organizationId);

    res.json({
      success: true,
      data: categories,
    });
  }

  // Get shop-specific categories only
  async getShopCategories(req, res) {
    const organizationId = Number.parseInt(req.params.organizationId);
    const categories = await categoryService.getShopCategories(organizationId);

    res.json({
      success: true,
      data: categories,
    });
  }

  // Create a new category
  async createCategory(req, res) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const data = req.body;

    const category = await categoryService.createCategory(data, userId, userRole);

    res.status(201).json({
      success: true,
      data: category,
    });
  }

  // Update category
  async updateCategory(req, res) {
    const categoryId = Number.parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const data = req.body;

    const category = await categoryService.updateCategory(categoryId, data, userId, userRole);

    res.json({
      success: true,
      data: category,
    });
  }

  // Delete category
  async deleteCategory(req, res) {
    const categoryId = Number.parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    await categoryService.deleteCategory(categoryId, userId, userRole);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }

  // Get category by ID
  async getCategory(req, res) {
    const categoryId = Number.parseInt(req.params.id);
    const category = await categoryService.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  }
}

export const categoryController = new CategoryController();
