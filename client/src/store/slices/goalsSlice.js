import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGoals = createAsyncThunk('goals/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/goals');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch goals');
  }
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    setGoals: (state, { payload }) => { state.list = payload; },
    addGoal: (state, { payload }) => { state.list.push(payload); },
    updateGoal: (state, { payload }) => {
      const idx = state.list.findIndex(g => g._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
    },
    removeGoal: (state, { payload }) => {
      state.list = state.list.filter(g => g._id !== payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGoals.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchGoals.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setGoals, addGoal, updateGoal, removeGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
