import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('budgeto_user');
const storedToken = localStorage.getItem('budgeto_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    isDemo: false,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isDemo = action.payload.isDemo || false;
      if (!state.isDemo) {
        localStorage.setItem('budgeto_user', JSON.stringify(action.payload.user));
        localStorage.setItem('budgeto_token', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('budgeto_user');
      localStorage.removeItem('budgeto_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
