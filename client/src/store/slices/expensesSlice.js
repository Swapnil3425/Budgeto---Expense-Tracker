import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchExpenses = createAsyncThunk('expenses/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/expenses');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch expenses');
  }
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    setExpenses: (state, { payload }) => { state.list = payload; },
    addExpense: (state, { payload }) => { state.list.unshift(payload); },
    updateExpense: (state, { payload }) => {
      const idx = state.list.findIndex(e => e._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
    },
    removeExpense: (state, { payload }) => {
      state.list = state.list.filter(e => e._id !== payload);
    },
    setLoading: (state, { payload }) => { state.loading = payload; },
    setError: (state, { payload }) => { state.error = payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpenses.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchExpenses.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setExpenses, addExpense, updateExpense, removeExpense, setLoading, setError } = expensesSlice.actions;
export default expensesSlice.reducer;
