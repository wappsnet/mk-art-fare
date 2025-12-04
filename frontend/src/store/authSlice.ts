import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';
import { api } from '@/services/apiSlice';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    // Handle login mutation
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
      if (action.payload.success && action.payload.data) {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.data.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.refreshToken);
      }
    });
    // Handle register mutation
    builder.addMatcher(api.endpoints.register.matchFulfilled, (state, action) => {
      if (action.payload.success && action.payload.data) {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        localStorage.setItem('accessToken', action.payload.data.accessToken);
        localStorage.setItem('refreshToken', action.payload.data.refreshToken);
      }
    });
    // Handle get profile query
    builder.addMatcher(api.endpoints.getProfile.matchFulfilled, (state, action) => {
      if (action.payload.success && action.payload.data) {
        state.user = action.payload.data;
        state.isAuthenticated = true;
      }
    });
    // Handle logout mutation
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
