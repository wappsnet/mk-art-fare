import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  sessionId: string;
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
  sessionId: getSessionId(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetSessionId: (state) => {
      state.sessionId = uuidv4();
      localStorage.setItem('cartSessionId', state.sessionId);
    },
  },
});

export const { resetSessionId } = cartSlice.actions;
export default cartSlice.reducer;
