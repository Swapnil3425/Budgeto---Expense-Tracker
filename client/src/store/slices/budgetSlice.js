import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBudgets = createAsyncThunk('budget/fetchBudgets', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/budgets');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch budgets');
  }
});

export const fetchSubscriptions = createAsyncThunk('budget/fetchSubscriptions', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/subscriptions');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch subscriptions');
  }
});

const budgetSlice = createSlice({
  name: 'budget',
  initialState: { list: [], subscriptions: [], loading: false, error: null },
  reducers: {
    setBudgets: (state, { payload }) => { state.list = payload; },
    setSubscriptions: (state, { payload }) => { state.subscriptions = payload; },
    addSubscription: (state, { payload }) => { state.subscriptions.push(payload); },
    removeSubscription: (state, { payload }) => {
      state.subscriptions = state.subscriptions.filter(s => s._id !== payload);
    },
    updateSubscription: (state, { payload }) => {
      const index = state.subscriptions.findIndex(s => s._id === payload._id);
      if (index !== -1) {
        state.subscriptions[index] = payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Budgets
      .addCase(fetchBudgets.pending, (state) => { state.loading = true; })
      .addCase(fetchBudgets.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchBudgets.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; })
      .addCase(fetchSubscriptions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subscriptions = payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setBudgets, setSubscriptions, addSubscription, removeSubscription, updateSubscription } = budgetSlice.actions;
export default budgetSlice.reducer;
