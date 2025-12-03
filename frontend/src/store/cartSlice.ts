import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../services/api';
import { Cart, ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  cart: Cart | null;
  sessionId: string;
  loading: boolean;
  error: string | null;
}

const getSessionId = () => {
  let sessionId = localStorage.getItem('cartSessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('cartSessionId', sessionId);
  }
  return sessionId;
};

const initialState: CartState = {
  cart: null,
  sessionId: getSessionId(),
  loading: false,
  error: null
};

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const response = await apiService.get<ApiResponse<Cart>>(
        `/cart?sessionId=${state.cart.sessionId}`
      );
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async (
    { productId, quantity }: { productId: number; quantity: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { cart: CartState };
      await apiService.post('/cart/items', {
        productId,
        quantity,
        sessionId: state.cart.sessionId
      });
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async (
    { productId, quantity }: { productId: number; quantity: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { cart: CartState };
      await apiService.patch(`/cart/items/${productId}?sessionId=${state.cart.sessionId}`, {
        quantity
      });
      return { productId, quantity };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      await apiService.delete(`/cart?sessionId=${state.cart.sessionId}`);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state) => {
        // Cart will be refetched after adding
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        // Cart will be refetched after updating
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null;
      });
  }
});

export default cartSlice.reducer;
