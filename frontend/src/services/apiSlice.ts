import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { ApiResponse, User, Product, CartItem, Order, BlogPost, Event, Organization, Category } from '../types';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

  if (result.error && result.error.status === 401) {
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
        const data = refreshResult.data as ApiResponse<{ accessToken: string; refreshToken: string }>;
        if (data.success && data.data) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        }
      } else {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Product', 'Cart', 'Order', 'Blog', 'Event', 'Organization', 'Address', 'Category'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart'],
    }),
    register: builder.mutation<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>, { email: string; password: string; first_name: string; last_name: string }>({
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
    getProducts: builder.query<ApiResponse<{ products: Product[]; total: number; page: number; limit: number }>, { search?: string; minPrice?: number; maxPrice?: number; category?: string; page?: number; limit?: number }>({
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
    getCart: builder.query<ApiResponse<{ items: CartItem[]; total: number }>, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<ApiResponse<void>, { product_id: number; quantity: number }>({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<ApiResponse<void>, { product_id: number; quantity: number }>({
      query: (data) => ({
        url: '/cart',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<ApiResponse<void>, number>({
      query: (product_id) => ({
        url: `/cart/${product_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
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
    createOrder: builder.mutation<ApiResponse<Order>, { shipping_address_id: number; payment_method: string; notes?: string }>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Blog endpoints
    getBlogPosts: builder.query<ApiResponse<{ posts: BlogPost[]; total: number; page: number; limit: number }>, { search?: string; page?: number; limit?: number }>({
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

    // Event endpoints
    getEvents: builder.query<ApiResponse<Event[]>, { type?: string; city?: string; startDate?: string; endDate?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.city) queryParams.append('city', params.city);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        return `/events?${queryParams.toString()}`;
      },
      providesTags: ['Event'],
    }),
    getEvent: builder.query<ApiResponse<Event>, string>({
      query: (slug) => `/events/${slug}`,
      providesTags: ['Event'],
    }),
    bookEvent: builder.mutation<ApiResponse<any>, { eventId: number; ticketId: number; quantity: number; attendeeInfo: any }>({
      query: ({ eventId, ...data }) => ({
        url: `/events/${eventId}/book`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Event', 'Order'],
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
    updateOrganization: builder.mutation<ApiResponse<Organization>, { id: number; data: Partial<Organization> }>({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Organization'],
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
    getUserAddresses: builder.query<ApiResponse<any[]>, void>({
      query: () => '/users/addresses',
      providesTags: ['Address'],
    }),
    createUserAddress: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/users/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Address'],
    }),

    // Dashboard stats
    getDashboardStats: builder.query<ApiResponse<any>, void>({
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
    updateCategory: builder.mutation<ApiResponse<Category>, { id: number; data: Partial<Category> }>({
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
    addProductImage: builder.mutation<ApiResponse<any>, { productId: number; data: { url: string; alt_text?: string; is_thumbnail?: boolean } }>({
      query: ({ productId, data }) => ({
        url: `/products/${productId}/images`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProductImage: builder.mutation<ApiResponse<any>, { productId: number; imageId: number; data: { url?: string; alt_text?: string; sort_order?: number; is_thumbnail?: boolean } }>({
      query: ({ productId, imageId, data }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProductImage: builder.mutation<ApiResponse<void>, { productId: number; imageId: number }>({
      query: ({ productId, imageId }) => ({
        url: `/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    reorderProductImages: builder.mutation<ApiResponse<any>, { productId: number; imageOrders: { id: number; sort_order: number }[] }>({
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
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useBookEventMutation,
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationProductsQuery,
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
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
