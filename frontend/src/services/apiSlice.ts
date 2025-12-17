import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  ApiResponse,
  User,
  Product,
  Order,
  BlogPost,
  Organization,
  Category,
  Cart,
  Address,
  CreateAddressInput,
  RegisterFormData,
} from '@/types/common';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data;
        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in data &&
          data.success &&
          'data' in data &&
          typeof data.data === 'object' &&
          data.data !== null &&
          'accessToken' in data.data &&
          'refreshToken' in data.data &&
          typeof data.data.accessToken === 'string' &&
          typeof data.data.refreshToken === 'string'
        ) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        globalThis.location.href = '/login';
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Product',
    'Cart',
    'Order',
    'Blog',
    'Organization',
    'Address',
    'Category',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart'],
    }),
    register: builder.mutation<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>,
      RegisterFormData
    >({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Cart', 'Order'],
    }),
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    // Product endpoints
    getProducts: builder.query<
      ApiResponse<{ products: Product[]; total: number; page: number; limit: number }>,
      {
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        category?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        return `/products?${queryParams.toString()}`;
      },
      providesTags: ['Product'],
    }),
    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, Partial<Product>>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<ApiResponse<Product>, { id: number; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    // Cart endpoints
    getCart: builder.query<ApiResponse<Cart>, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<
      ApiResponse<void>,
      { productId: number; quantity: number; sessionId?: string }
    >({
      query: (data) => ({
        url: '/cart/items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<
      ApiResponse<void>,
      { productId: number; quantity: number; sessionId?: string }
    >({
      query: ({ productId, quantity, sessionId }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity },
        params: {
          sessionId,
        },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<ApiResponse<void>, { productId: number; sessionId?: string }>({
      query: ({ productId, sessionId }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body: { quantity: 0 },
        params: {
          sessionId,
        },
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<ApiResponse<void>, string | undefined>({
      query: (sessionId) => ({
        url: `/cart`,
        method: 'DELETE',
        params: {
          sessionId,
        },
      }),
      invalidatesTags: ['Cart'],
    }),

    // Order endpoints
    getOrders: builder.query<ApiResponse<Order[]>, void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query<ApiResponse<Order>, number>({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<
      ApiResponse<Order>,
      { shipping_address_id: number; payment_method: string; notes?: string }
    >({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    getOrganizationOrders: builder.query<
      ApiResponse<{ data: Order[]; total: number; page: number; limit: number }>,
      { organizationId: number; page?: number; limit?: number }
    >({
      query: ({ organizationId, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (limit) queryParams.append('limit', limit.toString());
        return `/orders/organization/${organizationId}?${queryParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    getOrganizationStats: builder.query<
      ApiResponse<{
        total: unknown;
        byStatus: unknown[];
        recentRevenue: unknown[];
        topProducts: unknown[];
      }>,
      number
    >({
      query: (organizationId) => `/orders/organization/${organizationId}/stats`,
      providesTags: ['Order'],
    }),

    // Blog endpoints
    getBlogPosts: builder.query<
      ApiResponse<{ posts: BlogPost[]; total: number; page: number; limit: number }>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        return `/blog?${queryParams.toString()}`;
      },
      providesTags: ['Blog'],
    }),
    getBlogPost: builder.query<ApiResponse<BlogPost>, string>({
      query: (slug) => `/blog/${slug}`,
      providesTags: ['Blog'],
    }),
    createBlogPost: builder.mutation<ApiResponse<BlogPost>, Partial<BlogPost>>({
      query: (data) => ({
        url: '/blog',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Blog'],
    }),


    // Organization endpoints
    getOrganizations: builder.query<ApiResponse<Organization[]>, void>({
      query: () => '/organizations',
      providesTags: ['Organization'],
    }),
    getOrganization: builder.query<ApiResponse<Organization>, string>({
      query: (slug) => `/organizations/${slug}`,
      providesTags: ['Organization'],
    }),
    getOrganizationById: builder.query<ApiResponse<Organization>, number>({
      query: (id) => `/organizations/id/${id}`,
      providesTags: ['Organization'],
    }),
    getOrganizationProducts: builder.query<ApiResponse<Product[]>, string>({
      query: (slug) => `/organizations/${slug}/products`,
      providesTags: ['Product', 'Organization'],
    }),
    getOrganizationProductsById: builder.query<ApiResponse<Product[]>, number>({
      query: (id) => `/organizations/id/${id}/products`,
      providesTags: ['Product', 'Organization'],
    }),
    getMyOrganizations: builder.query<ApiResponse<Organization[]>, void>({
      query: () => '/organizations/my',
      providesTags: ['Organization'],
    }),
    createOrganization: builder.mutation<ApiResponse<Organization>, Partial<Organization>>({
      query: (data) => ({
        url: '/organizations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation<
      ApiResponse<Organization>,
      { id: number; data: Partial<Organization> }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganizationTheme: builder.mutation<
      ApiResponse<unknown>,
      { id: number; theme: Record<string, unknown> }
    >({
      query: ({ id, theme }) => ({
        url: `/organizations/${id}/theme`,
        method: 'PATCH',
        body: theme,
      }),
      invalidatesTags: ['Organization'],
    }),
    uploadOrganizationLogo: builder.mutation<
      ApiResponse<{ logo_url: string }>,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('logo', file);
        return {
          url: `/organizations/${id}/upload-logo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Organization'],
    }),
    uploadOrganizationBanner: builder.mutation<
      ApiResponse<{ banner_url: string }>,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('banner', file);
        return {
          url: `/organizations/${id}/upload-banner`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Organization'],
    }),

    // Admin Moderation endpoints
    moderateOrganization: builder.mutation<
      ApiResponse<Organization>,
      { id: number; status: 'approved' | 'declined'; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/admin/organizations/${id}/moderate`,
        method: 'PATCH',
        body: { status, note },
      }),
      invalidatesTags: ['Organization'],
    }),
    moderateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: number; status: 'approved' | 'declined'; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/admin/products/${id}/moderate`,
        method: 'PATCH',
        body: { status, note },
      }),
      invalidatesTags: ['Product'],
    }),

    // User endpoints
    getUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation<
      ApiResponse<User>,
      { first_name: string; last_name: string; email: string; phone?: string; bio?: string }
    >({
      query: (data) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<
      ApiResponse<{ message: string }>,
      { current_password: string; new_password: string }
    >({
      query: (data) => ({
        url: '/users/password',
        method: 'PATCH',
        body: data,
      }),
    }),
    getUserAddresses: builder.query<ApiResponse<Array<Address>>, void>({
      query: () => '/users/addresses',
      providesTags: ['Address'],
    }),
    createUserAddress: builder.mutation<ApiResponse<Address>, CreateAddressInput>({
      query: (data) => ({
        url: '/users/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),

    // Dashboard stats
    getDashboardStats: builder.query<ApiResponse<unknown>, void>({
      query: () => '/users/dashboard/stats',
      providesTags: ['Order', 'Product', 'Organization'],
    }),

    // Category endpoints
    getGlobalCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories/global',
      providesTags: ['Category'],
    }),
    getOrganizationCategories: builder.query<ApiResponse<Category[]>, number>({
      query: (organizationId) => `/categories/organization/${organizationId}`,
      providesTags: ['Category'],
    }),
    getShopCategories: builder.query<ApiResponse<Category[]>, number>({
      query: (organizationId) => `/categories/organization/${organizationId}/shop`,
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, Partial<Category>>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: number; data: Partial<Category> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Product Image endpoints
    addProductImage: builder.mutation<
      ApiResponse<unknown>,
      { productId: number; data: { url: string; alt_text?: string; is_thumbnail?: boolean } }
    >({
      query: ({ productId, data }) => ({
        url: `/products/${productId}/images`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProductImage: builder.mutation<
      ApiResponse<unknown>,
      {
        productId: number;
        imageId: number;
        data: { url?: string; alt_text?: string; sort_order?: number; is_thumbnail?: boolean };
      }
    >({
      query: ({ productId, imageId, data }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProductImage: builder.mutation<ApiResponse<void>, { productId: number; imageId: number }>(
      {
        query: ({ productId, imageId }) => ({
          url: `/products/${productId}/images/${imageId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Product'],
      }
    ),
    reorderProductImages: builder.mutation<
      ApiResponse<unknown>,
      { productId: number; imageOrders: { id: number; sort_order: number }[] }
    >({
      query: ({ productId, imageOrders }) => ({
        url: `/products/${productId}/images/reorder`,
        method: 'PUT',
        body: { imageOrders },
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useGetOrganizationOrdersQuery,
  useGetOrganizationStatsQuery,
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationProductsQuery,
  useGetOrganizationProductsByIdQuery,
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useUpdateOrganizationThemeMutation,
  useUploadOrganizationLogoMutation,
  useUploadOrganizationBannerMutation,
  useModerateOrganizationMutation,
  useModerateProductMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserAddressesQuery,
  useCreateUserAddressMutation,
  useGetDashboardStatsQuery,
  useGetGlobalCategoriesQuery,
  useGetOrganizationCategoriesQuery,
  useGetShopCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddProductImageMutation,
  useUpdateProductImageMutation,
  useDeleteProductImageMutation,
  useReorderProductImagesMutation,
} = api;
